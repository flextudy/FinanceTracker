import { SettlementStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId?: string) {
  const [users, allExpenses, completedSettlements, recentExpenses, recentSettlements, pendingSettlements] =
    await Promise.all([
      // 1. All users for balance map
      prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true },
      }),

      // 2. All expenses with splits for totalSpent & partner balances calculation
      prisma.expense.findMany({
        include: { splits: true },
      }),

      // 3. Completed settlements for net balance calculation
      prisma.settlement.findMany({
        where: { status: SettlementStatus.COMPLETED },
      }),

      // 4. Top 5 recent expenses for dashboard feed
      prisma.expense.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          paidBy: {
            select: { id: true, name: true, email: true },
          },
          splits: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          attachments: true,
        },
      }),

      // 5. Top 5 recent settlements for dashboard feed
      prisma.settlement.findMany({
        take: 5,
        orderBy: { settledAt: "desc" },
        include: {
          fromUser: { select: { id: true, name: true } },
          toUser: { select: { id: true, name: true } },
          attachments: true,
        },
      }),

      // 6. Pending settlements for target user (if provided)
      userId
        ? prisma.settlement.findMany({
            where: {
              toUserId: userId,
              status: SettlementStatus.PENDING,
            },
            include: {
              fromUser: { select: { id: true, name: true, email: true } },
              toUser: { select: { id: true, name: true, email: true } },
              attachments: true,
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

  // Compute balance
  const balance = users.map((user) => {
    let totalPaid = 0;
    let totalShare = 0;
    let moneySpent = 0;
    let moneyReceived = 0;

    for (const expense of allExpenses) {
      if (expense.paidById === user.id) {
        totalPaid += expense.amountPaid;
      }
      const split = expense.splits.find((s) => s.userId === user.id);
      if (split) {
        totalShare += split.amountPaid;
      }
    }

    for (const settlement of completedSettlements) {
      if (settlement.fromUserId === user.id) {
        moneySpent += settlement.amountPaid;
      }
      if (settlement.toUserId === user.id) {
        moneyReceived += settlement.amountPaid;
      }
    }

    return {
      userId: user.id,
      name: user.name,
      totalPaid,
      totalShare,
      moneySpent,
      moneyReceived,
      balance: totalPaid - totalShare + moneySpent - moneyReceived,
    };
  });

  const totalSpent = allExpenses.reduce((total, expense) => total + expense.amountPaid, 0);

  const currentYear = new Date().getFullYear();
  const monthlyExpenses = Array.from({ length: 12 }, (_, index) => ({
    month: new Date(currentYear, index, 1).toLocaleString("en", { month: "short" }),
    amount: 0,
  }));

  for (const expense of allExpenses) {
    const date = expense.expenseDate;
    if (date.getFullYear() === currentYear) {
      monthlyExpenses[date.getMonth()].amount += expense.amountPaid;
    }
  }

  return {
    summary: {
      totalSpent,
      balance,
      monthlyExpenses,
    },
    expenses: recentExpenses,
    settlements: recentSettlements,
    pendingSettlements,
  };
}
