import { deleteSite } from "../../../../lib/storage.js";

export const runtime = "nodejs";

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const removed = await deleteSite(id);
  return Response.json({ removed }, { status: removed ? 200 : 404 });
}
