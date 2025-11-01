import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter required" },
        { status: 400 }
      );
    }

    // Mock JIT activity response
    const jitActivity = {
      totalProfit: "$3,456",
      averageProfitPerOperation: "$150",
      successRate: "94.8%",
      operations: [
        {
          time: "2m ago",
          pair: "ETH/USDC",
          amount: "$25,000",
          profit: "+$127",
          status: "completed",
        },
        {
          time: "15m ago",
          pair: "WBTC/ETH",
          amount: "$18,500",
          profit: "+$94",
          status: "completed",
        },
      ],
    };

    return NextResponse.json(jitActivity, { status: 200 });
  } catch (error) {
    console.error("Error fetching JIT activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch JIT activity" },
      { status: 500 }
    );
  }
}
