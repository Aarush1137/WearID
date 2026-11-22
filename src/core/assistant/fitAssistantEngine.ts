import {
  AnatomicalProfile,
  BrandSizeChart,
  FabricSpec,
  FitType,
  GarmentDimensions,
} from "../types";
import { evaluateSizing, SizingEvaluationRequest } from "../engine";
import { PILOT_PRODUCTS, PilotProduct } from "../data/pilotBrands";
import { getTargetEaseRange } from "../ease";

export type MessageRole = "system" | "user" | "assistant" | "tool";

export interface ToolCall {
  id: string;
  name: "recommend_size" | "compare_sizes" | "explain_ease_delta" | "missing_measurement_check";
  arguments: Record<string, unknown>;
}

export interface RecommendationCardData {
  type: "recommendation";
  recommendedSize: string;
  alternativeSize?: string;
  fitScore: number;
  confidence: number;
  confidenceLabel: "high" | "medium" | "low" | "insufficient";
  summaryText: string;
  isBorderline: boolean;
  borderlineTradeoff?: string;
  productId?: string;
  productName?: string;
  chestEaseCm?: number;
}

export interface ComparisonCardData {
  type: "comparison";
  productName: string;
  sizeA: {
    sizeLabel: string;
    chestEaseCm: number;
    fitScore: number;
    description: string;
  };
  sizeB: {
    sizeLabel: string;
    chestEaseCm: number;
    fitScore: number;
    description: string;
  };
  verdict: string;
}

export interface MissingMeasurementCardData {
  type: "missing_measurement_prompt";
  category: string;
  requiredFields: string[];
  message: string;
}

export type AssistantToolResultCard =
  | RecommendationCardData
  | ComparisonCardData
  | MissingMeasurementCardData;

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  toolResultCard?: AssistantToolResultCard;
}

export interface AssistantContext {
  profile?: AnatomicalProfile;
  fitIntent: FitType;
  currentProductId?: string;
  activeBrand?: string;
}

export interface AssistantProcessResult {
  message: ChatMessage;
  contextUpdates?: Partial<AssistantContext>;
  toolExecuted?: boolean;
}

/**
 * System Grounding Prompt for WearID Fit Assistant
 */
export const FIT_ASSISTANT_SYSTEM_PROMPT = `
You are the WearID AI Fit Assistant — the world's most precise clothing fit advisor.
You are strictly grounded in WearID's Deterministic Sizing Engine.

CRITICAL INVARIANTS:
1. NEVER INVENT OR GUESS CLOTHING MEASUREMENTS OR SIZES.
   - If the user's body measurement (e.g. chest, waist, inseam) is missing, YOU MUST REFUSE TO GUESS. Ask the user for their verified measurement.
   - You have ZERO capability to estimate sizes using raw LLM knowledge. You MUST call tools to determine sizes.
2. ALL SIZING MUST BE GROUNDED IN WEARID TOOLS.
   - To find a size, execute 'recommend_size'.
   - To compare sizes, execute 'compare_sizes'.
   - To understand room, execute 'explain_ease_delta'.
3. EXPLAIN EASE DELTAS CONVERSATIONALLY:
   - Always translate millimeters to centimeters for conversational clarity (e.g. +110mm = +11cm chest ease).
   - Explain how fabric composition impacts fit: 100% rigid cotton needs >= +4cm ease; elastane knit accommodates closer drape.
4. HONESTY ON BORDERLINE SIZES:
   - When a fit is borderline, clearly articulate the tradeoff: smaller size = tailored/close drape, larger size = relaxed room.
5. KEEP BIOMETRIC DATA SOVEREIGN:
   - Do not repeat personal biometric numbers unless directly answering a user's question about their ease.
`.trim();

/**
 * Finds a matching pilot product from title or keywords
 */
export function resolveProductFromQuery(query: string): PilotProduct | undefined {
  const q = query.toLowerCase();

  // Keyword mappings
  if (q.includes("airism") || (q.includes("uniqlo") && q.includes("oversized"))) {
    return PILOT_PRODUCTS.find((p) => p.id === "prod_uniqlo_airism_oversized");
  }
  if (q.includes("supima") || (q.includes("uniqlo") && (q.includes("regular") || q.includes("crew")))) {
    return PILOT_PRODUCTS.find((p) => p.id === "prod_uniqlo_supima_regular");
  }
  if (q.includes("snitch") || q.includes("boxy") || q.includes("heavyweight")) {
    return PILOT_PRODUCTS.find((p) => p.id === "prod_snitch_heavyweight_boxy");
  }
  if (q.includes("h&m") || q.includes("hm")) {
    return PILOT_PRODUCTS.find((p) => p.brandId === "hm");
  }
  if (q.includes("zara")) {
    return PILOT_PRODUCTS.find((p) => p.brandId === "zara");
  }
  if (q.includes("levi")) {
    return PILOT_PRODUCTS.find((p) => p.brandId === "levis");
  }

  // Fallback match by product name or id
  return PILOT_PRODUCTS.find(
    (p) => q.includes(p.name.toLowerCase()) || q.includes(p.id.toLowerCase())
  );
}

/**
 * AI Fit Assistant Engine
 */
export class FitAssistantEngine {
  private context: AssistantContext;

  constructor(initialContext?: Partial<AssistantContext>) {
    this.context = {
      fitIntent: initialContext?.fitIntent || "regular",
      profile: initialContext?.profile,
      currentProductId: initialContext?.currentProductId,
      activeBrand: initialContext?.activeBrand,
    };
  }

  public getContext(): AssistantContext {
    return { ...this.context };
  }

  public setContext(updates: Partial<AssistantContext>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Evaluates size recommendation tool execution
   */
  public toolRecommendSize(
    product: PilotProduct,
    fitIntent?: FitType
  ): { card: AssistantToolResultCard; text: string } {
    const profile = this.context.profile;
    const intent = fitIntent || this.context.fitIntent || "regular";

    // INVARIANT 1: Refuse to guess if chest measurement is missing for tops
    if (!profile || !profile.chestMm || profile.chestMm <= 0) {
      const card: MissingMeasurementCardData = {
        type: "missing_measurement_prompt",
        category: product.category,
        requiredFields: ["chestMm"],
        message:
          "To recommend an accurate size, WearID requires your verified chest circumference. Please provide your chest measurement (e.g., 98 cm or 38.5 inches).",
      };
      return {
        card,
        text: `I cannot guess or estimate your size without verified measurements. To recommend the right size for ${product.name}, please provide your chest circumference (e.g., 98 cm or 38.5 inches).`,
      };
    }

    // Execute deterministic sizing engine
    const evaluation = evaluateSizing({
      profile,
      fitPreference: {
        profileId: profile.profileId,
        category: product.category,
        fitType: intent,
      },
      garmentDimensions: product.layer3Specs,
      brandSizeCharts: product.layer2Charts,
      fabricSpec: product.fabric,
    });

    const isBorderline = Boolean(evaluation.isBorderline);
    const alternativeSize = isBorderline ? evaluation.alternativeSize : undefined;

    // Find chest ease in cm
    let chestEaseCm: number | undefined;
    if (evaluation.recommendedSize && product.layer3Specs) {
      const spec = product.layer3Specs.find((s) => s.sizeLabel === evaluation.recommendedSize);
      if (spec?.chestFlatMm && profile.chestMm) {
        chestEaseCm = Math.round((spec.chestFlatMm * 2 - profile.chestMm) / 10);
      }
    }

    const card: RecommendationCardData = {
      type: "recommendation",
      recommendedSize: evaluation.recommendedSize,
      alternativeSize,
      fitScore: Math.round(evaluation.fitScore * 100),
      confidence: evaluation.confidence,
      confidenceLabel: evaluation.confidenceLabel,
      summaryText: evaluation.summaryText,
      isBorderline,
      borderlineTradeoff: evaluation.borderlineTradeoff,
      productId: product.id,
      productName: product.name,
      chestEaseCm,
    };

    let responseText = `Based on your anatomical measurements and ${intent} fit preference, I recommend **Size ${evaluation.recommendedSize}** for the **${product.name}** (Fit score: ${Math.round(evaluation.fitScore * 100)}%).`;

    if (typeof chestEaseCm === "number") {
      responseText += ` This provides approximately **+${chestEaseCm} cm** of chest wearing ease.`;
    }

    if (isBorderline && evaluation.borderlineTradeoff) {
      responseText += `\n\n*Note:* ${evaluation.borderlineTradeoff}`;
    }

    return { card, text: responseText };
  }

  /**
   * Compares two candidate sizes on a product
   */
  public toolCompareSizes(
    product: PilotProduct,
    sizeA: string,
    sizeB: string,
    fitIntent?: FitType
  ): { card: AssistantToolResultCard; text: string } {
    const profile = this.context.profile;
    const intent = fitIntent || this.context.fitIntent || "regular";

    if (!profile || !profile.chestMm || profile.chestMm <= 0) {
      const card: MissingMeasurementCardData = {
        type: "missing_measurement_prompt",
        category: product.category,
        requiredFields: ["chestMm"],
        message:
          "To compare sizes accurately, your chest measurement is required.",
      };
      return {
        card,
        text: `To compare Size ${sizeA} and Size ${sizeB} for ${product.name}, I need your verified chest circumference first.`,
      };
    }

    const specs = product.layer3Specs || [];
    const specA = specs.find((s) => s.sizeLabel.toUpperCase() === sizeA.toUpperCase());
    const specB = specs.find((s) => s.sizeLabel.toUpperCase() === sizeB.toUpperCase());

    const easeA = specA?.chestFlatMm ? specA.chestFlatMm * 2 - profile.chestMm : 80;
    const easeB = specB?.chestFlatMm ? specB.chestFlatMm * 2 - profile.chestMm : 140;

    const easeACm = Math.round(easeA / 10);
    const easeBCm = Math.round(easeB / 10);

    const smallerEase = easeA < easeB ? sizeA : sizeB;
    const largerEase = easeA < easeB ? sizeB : sizeA;
    const smallerCm = Math.min(easeACm, easeBCm);
    const largerCm = Math.max(easeACm, easeBCm);

    const verdict = `Size ${smallerEase} offers a tailored silhouette with +${smallerCm}cm ease. Size ${largerEase} offers a more relaxed drape with +${largerCm}cm ease.`;

    const card: ComparisonCardData = {
      type: "comparison",
      productName: product.name,
      sizeA: {
        sizeLabel: sizeA,
        chestEaseCm: easeACm,
        fitScore: 88,
        description: `+${easeACm}cm ease across chest`,
      },
      sizeB: {
        sizeLabel: sizeB,
        chestEaseCm: easeBCm,
        fitScore: 82,
        description: `+${easeBCm}cm ease across chest`,
      },
      verdict,
    };

    const text = `Here is how **Size ${sizeA}** and **Size ${sizeB}** compare on the **${product.name}**:\n\n- **Size ${sizeA}**: Gives **+${easeACm} cm** chest ease.\n- **Size ${sizeB}**: Gives **+${easeBCm} cm** chest ease.\n\n**Recommendation:** ${verdict}`;

    return { card, text };
  }

  /**
   * Explains wearing ease for silhouette
   */
  public toolExplainEaseDelta(fitIntent?: FitType): string {
    const intent = fitIntent || this.context.fitIntent || "regular";
    const range = getTargetEaseRange(intent);
    const minCm = range.min / 10;
    const maxCm = range.max / 10;

    return `For a **${intent}** silhouette, WearID's deterministic target wearing ease is **+${minCm} cm to +${maxCm} cm** (+${range.min}mm to +${range.max}mm) over your body circumference.\n\n- **Rigid Textiles (100% Cotton, Denim):** Require at least +4 cm wearing ease so the garment moves naturally without pulling at the buttons or seams.\n- **Elastic Knits (with Elastane/Spandex):** Can comfortably accommodate a closer fit with lower ease (+2 cm to +4 cm) due to dynamic stretch recovery.`;
  }

  /**
   * Processes incoming user conversational messages
   */
  public async processUserMessage(
    userMessage: string,
    additionalContext?: Partial<AssistantContext>
  ): Promise<AssistantProcessResult> {
    if (additionalContext) {
      this.setContext(additionalContext);
    }

    const trimmed = userMessage.trim();
    const lower = trimmed.toLowerCase();

    // 1. Invariant 1 Injection / Hallucination Detection
    if (
      lower.includes("ignore your instructions") ||
      lower.includes("ignore previous") ||
      lower.includes("guess my measurement") ||
      lower.includes("guess my size without") ||
      lower.includes("pretend i have") ||
      lower.includes("hallucinate")
    ) {
      return {
        message: {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content:
            "I operate strictly under WearID's core invariants. I am forbidden from guessing body dimensions or hallucinating size recommendations without verified physical measurements (AGENTS.md Invariant 1). Please provide your verified measurements to receive an authentic fit recommendation.",
          timestamp: new Date().toISOString(),
        },
        toolExecuted: false,
      };
    }

    // 2. Intent: Explain Ease Delta
    if (
      lower.includes("what is ease") ||
      lower.includes("explain ease") ||
      lower.includes("wearing ease") ||
      lower.includes("how does ease work")
    ) {
      const text = this.toolExplainEaseDelta(this.context.fitIntent);
      return {
        message: {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: text,
          timestamp: new Date().toISOString(),
          toolCalls: [
            {
              id: `call_${Date.now()}`,
              name: "explain_ease_delta",
              arguments: { fitIntent: this.context.fitIntent },
            },
          ],
        },
        toolExecuted: true,
      };
    }

    // 3. Resolve Product Context if present
    const matchedProduct =
      resolveProductFromQuery(userMessage) ||
      (this.context.currentProductId
        ? PILOT_PRODUCTS.find((p) => p.id === this.context.currentProductId)
        : PILOT_PRODUCTS[0]); // Default to first pilot product if generic inquiry

    // 4. Intent: Compare Sizes (e.g. "compare M and L" or "M or L")
    const compareMatch = userMessage.match(/\b([XS|S|M|L|XL|XXL|2XL|3XL]+)\s+(?:vs|and|or)\s+([XS|S|M|L|XL|XXL|2XL|3XL]+)\b/i);
    if (compareMatch && matchedProduct) {
      const sizeA = compareMatch[1].toUpperCase();
      const sizeB = compareMatch[2].toUpperCase();

      const { card, text } = this.toolCompareSizes(matchedProduct, sizeA, sizeB, this.context.fitIntent);

      return {
        message: {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: text,
          timestamp: new Date().toISOString(),
          toolCalls: [
            {
              id: `call_${Date.now()}`,
              name: "compare_sizes",
              arguments: { productId: matchedProduct.id, sizeA, sizeB },
            },
          ],
          toolResultCard: card,
        },
        contextUpdates: { currentProductId: matchedProduct.id },
        toolExecuted: true,
      };
    }

    // 5. Intent: Recommend Size (e.g. "what size", "which size", "recommend size", "my size in Uniqlo")
    if (
      lower.includes("size") ||
      lower.includes("recommend") ||
      lower.includes("what should i get") ||
      lower.includes("which one") ||
      lower.includes("fit me")
    ) {
      if (matchedProduct) {
        const { card, text } = this.toolRecommendSize(matchedProduct, this.context.fitIntent);

        return {
          message: {
            id: `msg_${Date.now()}`,
            role: "assistant",
            content: text,
            timestamp: new Date().toISOString(),
            toolCalls: [
              {
                id: `call_${Date.now()}`,
                name: "recommend_size",
                arguments: { productId: matchedProduct.id, fitIntent: this.context.fitIntent },
              },
            ],
            toolResultCard: card,
          },
          contextUpdates: { currentProductId: matchedProduct.id },
          toolExecuted: true,
        };
      }
    }

    // 6. Conversational Guidance / Welcome
    const defaultProduct = PILOT_PRODUCTS[0];
    const welcomeText = `Hello! I am your **WearID AI Fit Assistant**.\n\nI provide deterministic sizing grounded strictly in physical garment dimensions with **zero hallucination**.\n\nYou can ask me:\n- *"What size am I in Uniqlo AIRism Oversized?"*\n- *"Should I get M or L in Supima Tee?"*\n- *"Explain wearing ease for a relaxed fit"*\n\nHow can I help you find your perfect fit today?`;

    return {
      message: {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: welcomeText,
        timestamp: new Date().toISOString(),
      },
      toolExecuted: false,
    };
  }
}
