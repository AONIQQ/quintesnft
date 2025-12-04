import { NextRequest, NextResponse } from "next/server";
import { getMerkleProof, isWhitelisted } from "@/lib/merkle";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
        return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    // Check if address is whitelisted using merkle tree
    const eligible = isWhitelisted(address);

    if (eligible) {
        const proof = getMerkleProof(address);
        return NextResponse.json({ proof, eligible: true });
    }

    return NextResponse.json({ proof: [], eligible: false });
}
