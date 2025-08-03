import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// Simple test mutation to verify connection
export const testConnection = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    return { success: true, userId: identity.subject, timestamp: Date.now() };
  },
});

// Generate upload URL for file upload
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Generate a short-lived upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

// Create note after successful file upload
export const createNoteAfterUpload = mutation({
  args: {
    fileId: v.id("_storage"),
    title: v.string(),
    description: v.optional(v.string()),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const noteId = await ctx.db.insert("notes", {
      title: args.title,
      description: args.description,
      fileId: args.fileId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      isPublic: false, // Default to private
      passwordEnabled: false,
      userId: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return noteId;
  },
});

// Get file metadata and generate secure URL
export const getFileData = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Get the file URL from Convex storage
    const fileUrl = await ctx.storage.getUrl(args.fileId);

    return fileUrl;
  },
});

// Get secure file URL for a specific note
export const getSecureFileUrl = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new ConvexError("Note not found");
    }

    // Check if user owns the note or if it's public
    if (note.userId !== identity.subject && !note.isPublic) {
      throw new ConvexError("Access denied");
    }

    // Get the file URL from Convex storage
    const fileUrl = await ctx.storage.getUrl(note.fileId);

    return {
      fileUrl,
      fileName: note.fileName,
      fileType: note.fileType,
      fileSize: note.fileSize,
    };
  },
});
