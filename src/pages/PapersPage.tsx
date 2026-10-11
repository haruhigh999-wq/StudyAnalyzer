import type { WorkspacePageProps } from "./types";
export function PapersPage({
  heading,
  addButton,
  filters,
  paperRows,
  filteredPapers,
}: WorkspacePageProps) {
  return (
    <>
      {heading("papers", "papersIntro", addButton("paper"))}
      {filters("paper")}
      <section className="card">{paperRows(filteredPapers)}</section>
    </>
  );
}
