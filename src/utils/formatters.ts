export function formatCategoriesToString(categories: any) {
  // if (!categories) return '';
  return categories
    .map((category: any) => `id: ${category.id}, name: ${category.name}`)
    .join("\n");
}

export function formatCustomerToString(customer: any) {
  return `id: ${customer.id}, name: ${customer.first_name} ${customer.last_name}, email: ${customer.email}`;
}

export function formatObject(obj: any) {
  let formattedString = "";

  for (const [key, value] of Object.entries(obj)) {
    formattedString += `${key}: ${value}\n`;
  }

  return formattedString.trim();
}
