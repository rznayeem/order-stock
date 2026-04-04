"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { toast } from "sonner";
import { Loader2, Package2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isLogin = mode === "login";
  const schema = isLogin ? loginSchema : registerSchema;

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn.email(
          { email: data.email, password: data.password },
          {
            onSuccess: () => {
              toast.success("Welcome back!");
              router.push("/dashboard");
            },
            onError: (ctx) => {
              toast.error(ctx.error.message || "Invalid credentials");
              setIsLoading(false);
            },
          }
        );
      } else {
        await signUp.email(
          { email: data.email, password: data.password, name: data.name },
          {
            onSuccess: () => {
              toast.success("Account created successfully!");
              router.push("/dashboard");
            },
            onError: (ctx) => {
              toast.error(ctx.error.message || "Failed to create account");
              setIsLoading(false);
            },
          }
        );
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    form.setValue("email", "demo@orderstock.com");
    form.setValue("password", "demo1234");
    toast.info("Demo credentials applied. Click Sign In.");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-4">
          <Package2 className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Order<span className="text-primary">Stock</span></h1>
        <p className="text-muted-foreground mt-2 text-center text-sm">
          {isLogin ? "Enter your credentials to access your account" : "Create an account to start managing your inventory"}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-[#1E1E1E] p-8 rounded-3xl border border-slate-200 dark:border-[#333] shadow-xl"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message as string}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@example.com" {...form.register("email")} />
            {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message as string}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {isLogin && <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>}
            </div>
            <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
            {form.formState.errors.password && <p className="text-sm text-red-500">{form.formState.errors.password.message as string}</p>}
          </div>

          <Button type="submit" className="w-full rounded-xl h-11 text-base shadow-lg shadow-primary/20" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLogin ? "Sign In" : "Create Account"}
          </Button>

          {isLogin && (
            <div className="pt-4 flex flex-col items-center border-t border-border mt-4 border-dashed gap-4">
              <p className="text-sm text-muted-foreground">Want to try it out?</p>
              <Button type="button" variant="outline" onClick={handleDemoLogin} className="w-full rounded-xl border-primary/20 hover:bg-primary/5 text-primary">
                Use Demo Credentials
              </Button>
            </div>
          )}
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link href={isLogin ? "/auth/register" : "/auth/login"} className="text-primary font-medium hover:underline">
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
