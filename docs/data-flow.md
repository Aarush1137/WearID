# docs/data-flow.md — Measurement Data Flow (Layers 1 $\rightarrow$ 4)

> **Fit / WearID — Universal Clothing Size Profile**  
> Complete specification of data transformation, domain segregation, ease calculation, and state transition between the four distinct layers.

---

## 1. The Four Non-Conflated Data Layers

```mermaid
flowchart TD
    subgraph L1 ["Layer 1: User's Actual Body Measurements"]
        Body_Chest["Chest Girth (e.g. 960 mm)"]
        Body_Shoulder["Shoulder Span (e.g. 440 mm)"]
        Body_Waist["Waist Girth (e.g. 840 mm)"]
    end

    subgraph L4 ["Layer 4: User's Fit Intent per Category"]
        Fit_Pref["Category Intent (e.g. T-Shirt: 'Regular Fit', Jeans: 'Slim')"]
    end

    subgraph SizingCore ["Deterministic Sizing Evaluation Engine"]
        Ease_Calc["Ease Formula: Garment Dimension - Body Dimension"]
        Penalty_Calc["Negative Ease & Stretch Penalty Functions"]
        Weight_Matrix["Category Dimension Weighting (e.g. Chest 40%, Shoulder 35%)"]
        Calibration["Reference Garment Calibration (+/- 0.15 score adjustment)"]
    end

    subgraph L3 ["Layer 3: Physical Finished Garment Dimensions (Flat Specs)"]
        G_Chest["Flat Pit-to-Pit x 2 (e.g. 530 mm x 2 = 1060 mm)"]
        G_Shoulder["Shoulder Seam-to-Seam (e.g. 460 mm)"]
        G_Length["HPS to Hem (e.g. 710 mm)"]
    end

    subgraph L2 ["Layer 2: Brand Body-Fit Chart (Fallback)"]
        B_Range["Brand Recommended Body Range (e.g. Size M: 940–1020 mm)"]
    end

    L1 --> SizingCore
    L4 --> SizingCore
    L3 -. Preferred Source .-> SizingCore
    L2 -. Fallback Source .-> SizingCore

    SizingCore --> RecOut["Size Recommendation DTO + ExplanationTree"]
```

---

## 2. Ease Calculation & Mathematical Boundaries

### 2.1 Formula for Layer 3 (Garment Measurements)
$$\text{Garment Chest Circumference} = \text{chest\_flat\_mm} \times 2$$
$$\text{Chest Ease} = \text{Garment Chest Circumference} - \text{Body Chest Circumference}$$

### 2.2 Expected Ease Ranges by Fit Type (Men's T-Shirts)

| Fit Intent | Target Ease Range (mm) | Target Ease Range (cm) | Ideal Midpoint |
| :--- | :--- | :--- | :--- |
| **Slim** | `40 mm – 80 mm` | `4.0 cm – 8.0 cm` | `60 mm` (`6.0 cm`) |
| **Regular** | `80 mm – 140 mm` | `8.0 cm – 14.0 cm` | `110 mm` (`11.0 cm`) |
| **Relaxed** | `140 mm – 200 mm` | `14.0 cm – 20.0 cm` | `170 mm` (`17.0 cm`) |
| **Oversized** | `200 mm – 300 mm` | `20.0 cm – 30.0 cm` | `250 mm` (`25.0 cm`) |

### 2.3 Ease Scoring Function
$$\text{Ease Score} = \exp\left( - \frac{(\text{Ease} - \text{Midpoint})^2}{2 \times \sigma^2} \right)$$
- If $\text{Ease} < 0$ on rigid fabric (0% elastane), $\text{Score} = 0.0$ (Strict Rejection).
- If $\text{Ease} < 0$ on stretch fabric ($\ge 5\%$ elastane), $\text{Score}$ scales with compression tolerance.
