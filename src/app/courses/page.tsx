import PublicCoursesCatalogue from "@/components/PublicCoursesCatalogue";

export default async function CoursesPage({ searchParams }: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialFilter = type === "accredited" ? "Accredited" : type === "non-accredited" ? "Non-accredited" : "All";
  return <PublicCoursesCatalogue key={initialFilter} initialFilter={initialFilter} />;
}
