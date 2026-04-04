"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  minStockThreshold: z.coerce.number().int().min(1, "Threshold must be at least 1"),
});

export function ProductForm({ categories, initialData, onClose, userId }: { categories: any[], initialData?: any, onClose: () => void, userId: string }) {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      categoryId: initialData?.categoryId || "",
      price: initialData?.price || 0,
      stockQuantity: initialData?.stockQuantity || 0,
      minStockThreshold: initialData?.minStockThreshold || 5,
    },
  });

  const isEditing = !!initialData;

  const mutation = useAppMutation({
    mutationFn: (data: any) => {
      const payload = { ...data, userId };
      return isEditing 
        ? axiosInstance.patch(`/products/${initialData.id}?userId=${userId}`, payload)
        : axiosInstance.post(`/products`, payload);
    },
    invalidateKeys: [["products"], ["dashboard-stats"]],
    successMessage: isEditing ? "Product updated successfully" : "Product added successfully",
  });

  const onSubmit = async (data: any) => {
    await mutation.mutateAsync(data);
    onClose();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" {...form.register("name")} placeholder="Premium Wireless Headphones" />
        {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select 
            onValueChange={(val) => form.setValue("categoryId", val)} 
            defaultValue={form.getValues("categoryId")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.categoryId && <p className="text-sm text-red-500">{form.formState.errors.categoryId.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input id="price" type="number" step="0.01" {...form.register("price")} />
          {form.formState.errors.price && <p className="text-sm text-red-500">{form.formState.errors.price.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">Current Stock</Label>
          <Input id="stockQuantity" type="number" {...form.register("stockQuantity")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minStockThreshold">Low Stock Alert Threshold</Label>
          <Input id="minStockThreshold" type="number" {...form.register("minStockThreshold")} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {isEditing ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
