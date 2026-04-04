"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { Plus, Trash2, AlertTriangle, XCircle } from "lucide-react";
import { useMemo } from "react";

const orderSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  })).min(1, "At least one item is required"),
});

type OrderFormData = z.infer<typeof orderSchema>;

export function OrderForm({ products, onClose, userId }: { products: any[], onClose: () => void, userId: string }) {
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema) as any,
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

  // Watch all form values for real-time validation
  const watchedItems = useWatch({ control: form.control, name: "items" });

  // === CONFLICT DETECTION ===
  const validationIssues = useMemo(() => {
    const issues: { index: number; type: "duplicate" | "stock" | "unavailable"; message: string }[] = [];
    const seenProducts = new Map<string, number>();

    (watchedItems || []).forEach((item, index) => {
      if (!item.productId) return;

      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      // 1. Check for duplicate product entries
      if (seenProducts.has(item.productId)) {
        issues.push({
          index,
          type: "duplicate",
          message: `This product is already added to the order.`,
        });
      }
      seenProducts.set(item.productId, index);

      // 2. Check if product is inactive/unavailable
      if (product.status === "OUT_OF_STOCK" || product.stockQuantity <= 0) {
        issues.push({
          index,
          type: "unavailable",
          message: `This product is currently unavailable.`,
        });
      }

      // 3. Check if requested quantity exceeds stock
      if (item.quantity > 0 && item.quantity > product.stockQuantity && product.stockQuantity > 0) {
        issues.push({
          index,
          type: "stock",
          message: `Only ${product.stockQuantity} items available in stock.`,
        });
      }
    });

    return issues;
  }, [watchedItems, products]);

  const hasBlockingIssues = validationIssues.some(i => i.type === "duplicate" || i.type === "unavailable" || i.type === "stock");

  // Calculate total price dynamically
  const totalPrice = (watchedItems || []).reduce((total: number, item: any) => {
    const product = products.find(p => p.id === item.productId);
    return total + (Number(product?.price) || 0) * (Number(item.quantity) || 0);
  }, 0);

  const onSubmit = async (data: OrderFormData) => {
    if (hasBlockingIssues) return;
    await mutation.mutateAsync(data);
    onClose();
  };

  const getIssuesForIndex = (index: number) => validationIssues.filter(i => i.index === index);

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

        {fields.map((field, index) => {
          const itemIssues = getIssuesForIndex(index);
          const selectedProduct = products.find(p => p.id === watchedItems?.[index]?.productId);

          return (
            <div key={field.id} className="space-y-2">
              <div className="flex gap-3 items-start relative">
                <div className="w-full space-y-2">
                  <Select 
                    onValueChange={(val) => form.setValue(`items.${index}.productId`, val)}
                    defaultValue={field.productId}
                  >
                    <SelectTrigger className={itemIssues.length > 0 ? "border-red-500" : form.formState.errors.items?.[index]?.productId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => {
                        const outOfStock = p.stockQuantity <= 0 || p.status === "OUT_OF_STOCK";
                        return (
                          <SelectItem key={p.id} value={p.id} disabled={outOfStock}>
                            <div className="flex justify-between w-full pr-8">
                              <span>{p.name}</span>
                              <span className={`ml-4 ${outOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {outOfStock ? "— Unavailable" : `${p.stockQuantity} in stock`}
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

              {/* Stock info for selected product */}
              {selectedProduct && !itemIssues.length && (
                <p className="text-[11px] text-muted-foreground pl-1">
                  📦 {selectedProduct.stockQuantity} available · ${selectedProduct.price.toFixed(2)} each
                </p>
              )}

              {/* Inline conflict/warning messages */}
              {itemIssues.map((issue, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                  issue.type === "stock" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" :
                  "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                }`}>
                  {issue.type === "stock" 
                    ? <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> 
                    : <XCircle className="h-3.5 w-3.5 shrink-0" />
                  }
                  <span className="font-medium">{issue.message}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/20">
        <span className="font-semibold text-lg text-primary">Total Price</span>
        <span className="font-bold text-2xl">${totalPrice.toFixed(2)}</span>
      </div>

      {hasBlockingIssues && (
        <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">Please resolve all warnings before placing the order.</span>
        </div>
      )}

      <div className="flex justify-end gap-2 p-1">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending || hasBlockingIssues}>
          Place Order
        </Button>
      </div>
    </form>
  );
}
