import { requireUserId } from "@/lib/db/rls";
import { getCategories } from "@/lib/categories";
import { CategoryForm } from "@/components/category/category-form";
import { CategoryList } from "@/components/category/category-list";

export default async function CategoriesPage() {
  const userId = await requireUserId();
  const categories = await getCategories(userId);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
        <p className="text-sm text-muted-foreground">
          Kelola kategori buat todo dan habit kamu.
        </p>
      </div>

      <CategoryForm />
      <CategoryList categories={categories} />
    </div>
  );
}
