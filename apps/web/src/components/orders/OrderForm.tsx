"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { Plus, Trash2 } from "lucide-react";

const orderSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  })).min(1, "At least one item is required"),
});

export function OrderForm({ products, onClose, userId }: { products: any[], onClose: () => void, userId: string }) {
  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const mutation = useAppMutation({
    mutationFn: (data: any) => axiosInstance.post(`/orders`, { ...data, userId }),
    invalidateKeys: [["orders"], ["dashboard-stats"], ["products"], ["restock-queue"]],
    successMessage: "Order placed successfully! Stock deducted.",
  });

  // Calculate total price dynamically
  const formValues = form.watch();
  const totalPrice = (formValues.items || []).reduce((total: number, item: any) => {
    const product = products.find(p => p.id === item.productId);
    return total + (Number(product?.price) || 0) * (Number(item.quantity) || 0);
  }, 0);

  const onSubmit = async (data: any) => {
    await mutation.mutateAsync(data);
    onClose();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input id="customerName" {...form.register("customerName")} placeholder="Jane Doe" />
        {form.formState.errors.customerName && <p className="text-sm text-red-500">{form.formState.errors.customerName.message as string}</p>}
      </div>

      <div className="bg-muted/20 p-4 rounded-xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Order Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1 })}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>

        {form.formState.errors.items?.root && <p className="text-sm text-red-500">{form.formState.errors.items.root.message as string}</p>}

        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-3 items-start relative">
            <div className="w-full space-y-2">
              <Select 
                onValueChange={(val) => form.setValue(`items.${index}.productId`, val)}
                defaultValue={field.productId}
              >
                <SelectTrigger className={form.formState.errors.items?.[index]?.productId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => {
                    const outOfStock = p.stockQuantity <= 0;
                    return (
                      <SelectItem key={p.id} value={p.id} disabled={outOfStock}>
                        <div className="flex justify-between w-full pr-8">
                          <span>{p.name}</span>
                          <span className={`${outOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {outOfStock ? "Out of Stock" : `${p.stockQuantity} in stock`}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32 space-y-2">
              <Input 
                type="number" 
                placeholder="Qty" 
                {...form.register(`items.${index}.quantity`)} 
                className={form.formState.errors.items?.[index]?.quantity ? "border-red-500" : ""}
              />
            </div>
            {fields.length > 1 && (
              <Button type="button" variant="ghost" size="icon" className="text-destructive mt-0.5" onClick={() => remove(index)}>
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/20">
        <span className="font-semibold text-lg text-primary">Total Price</span>
        <span className="font-bold text-2xl">${totalPrice.toFixed(2)}</span>
      </div>

      <div className="flex justify-end gap-2 p-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          Place Order
        </Button>
      </div>
    </form>
  );
}
