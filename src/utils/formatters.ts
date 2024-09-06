export function formatCategoriesToString(categories: any) {
  return categories
    .map((category: any) => `id: ${category.id}, name: ${category.name}`)
    .join("\n");
}
