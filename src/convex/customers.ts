import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUser } from "./lib";

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Sign in to update your details.");
    const patch: Record<string, string | undefined> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 2) throw new Error("Please enter your name.");
      patch.name = name;
    }
    if (args.phone !== undefined) patch.phone = args.phone.trim() || undefined;
    if (args.city !== undefined) patch.city = args.city.trim() || undefined;
    await ctx.db.patch(user._id, patch);
    return null;
  },
});
