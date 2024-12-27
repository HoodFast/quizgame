import { Statistic } from "../../domain/statistic.sql.entity";

export const topMapper = (statistic: Statistic) => {
  return {
    sumScore: statistic.sumScore,
    avgScores: statistic.avgScores,
    gamesCount: statistic.gamesCount,
    winsCount: statistic.winsCount,
    lossesCount: statistic.lossesCount,
    drawsCount: statistic.drawsCount,
    player: {
      id: statistic.user.id,
      login: statistic.user.login,
    },
  };
};
