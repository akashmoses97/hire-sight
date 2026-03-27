import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

CSV_PATH = Path("backend/data/recruitment_data.csv")

ROLE_MAPPING = {
    "data analyst": "Data Analyst",
    "data engineer": "Data Engineer",
    "data scientist": "Data Scientist",
    "data architect": "Data Architect",
    "software engineer": "Software Engineer",
    "software developer": "Software Engineer",
    "full stack developer": "Full Stack Developer",
    "ai engineer": "ML/AI Engineer",
    "machine learning engineer": "ML/AI Engineer",
    "ai researcher": "AI Researcher",
    "ui designer": "UI/UX Designer",
    "ux designer": "UI/UX Designer",
    "ui/ux designer": "UI/UX Designer",
    "cybersecurity analyst": "Cybersecurity",
    "cybersecurity specialist": "Cybersecurity",
    "cloud engineer": "Cloud Engineering",
    "cloud architect": "Cloud Engineering",
    "hr specialist": "HR Specialist",
    "human resources specialist": "HR Specialist",
    "product manager": "Product Manager",
    "project manager": "Project Manager",
    "qa engineer": "QA Engineer",
    "network engineer": "Network Engineer",
    "system administrator": "System Administrator",
    "database administrator": "Database Administrator",
    "devops engineer": "DevOps Engineer",
    "mobile app developer": "Mobile App Developer",
    "game developer": "Game Developer",
    "graphic designer": "Graphic Designer",
    "content writer": "Content Writer",
    "digital marketing specialist": "Digital Marketing Specialist",
    "e-commerce specialist": "E-commerce Specialist",
    "business analyst": "Business Analyst",
    "robotics engineer": "Robotics Engineer",
    "ar/vr developer": "AR/VR Developer",
    "it support specialist": "IT Support Specialist",
    "ui engineer": "UI Engineer",
}


def normalize_role(role: str) -> str:
    cleaned = role.strip()
    lowered = cleaned.lower()
    return ROLE_MAPPING.get(lowered, cleaned.title())


def main() -> None:
    df = pd.read_csv(CSV_PATH)
    raw_roles = df["Role"].dropna().astype(str).str.strip()
    cleaned_roles = raw_roles.apply(normalize_role)
    unique_roles = sorted(cleaned_roles.unique())
    role_counts = cleaned_roles.value_counts().sort_values(ascending=False)
    decision_series = df.loc[raw_roles.index, "decision"].astype(str).str.strip().str.lower()

    print(f"CSV: {CSV_PATH}")
    print(f"Total rows: {len(df)}")
    print(f"Non-empty role rows: {len(raw_roles)}")
    print(f"Unique cleaned roles: {len(unique_roles)}")
    print()

    print("Cleaned role counts:")
    for role, count in role_counts.items():
        print(f"{role}: {count}")

    print()
    print("Unique cleaned role values:")
    for role in unique_roles:
        print(role)

    heatmap_df = pd.DataFrame({
        "Role": cleaned_roles,
        "Decision": decision_series,
    })

    heatmap_df = heatmap_df[heatmap_df["Decision"].isin(["select", "reject"])]

    decision_counts = (
        heatmap_df.groupby(["Role", "Decision"])
        .size()
        .unstack(fill_value=0)
        .reindex(columns=["select", "reject"], fill_value=0)
    )

    role_totals = decision_counts.sum(axis=1)
    decision_rates = (
        decision_counts.div(role_totals, axis=0)
        .fillna(0)
        .rename(columns={"select": "Selected %", "reject": "Rejected %"})
        .sort_values(by="Selected %", ascending=False)
    )

    print()
    print(f"Rendering heatmap for all {len(decision_rates)} cleaned roles.")

    fig_height = max(6, len(decision_rates) * 0.45)
    fig, ax = plt.subplots(figsize=(8, fig_height))

    heatmap_values = decision_rates.to_numpy()
    im = ax.imshow(heatmap_values, cmap="YlGnBu", aspect="auto", vmin=0, vmax=1)

    ax.set_xticks(np.arange(decision_rates.shape[1]))
    ax.set_xticklabels(decision_rates.columns)
    ax.set_yticks(np.arange(decision_rates.shape[0]))
    ax.set_yticklabels(decision_rates.index)
    ax.set_title("Role Conversion Heatmap")
    ax.set_xlabel("Outcome")
    ax.set_ylabel("Cleaned Role")

    for i in range(heatmap_values.shape[0]):
        for j in range(heatmap_values.shape[1]):
            value = heatmap_values[i, j]
            ax.text(
                j,
                i,
                f"{value:.1%}",
                ha="center",
                va="center",
                color="black" if value < 0.65 else "white",
            )

    cbar = fig.colorbar(im, ax=ax)
    cbar.set_label("Rate")

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
