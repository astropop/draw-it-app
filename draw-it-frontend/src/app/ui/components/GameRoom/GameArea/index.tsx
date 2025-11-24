"use client";
import { GameStatus } from "@/app/types/game.type";
import { Card, CardContent } from "@mui/material";
import GameAreaInProgress, {
  GameAreaInProgressProps,
} from "./GameAreaInProgress";
import GameAreaWaiting, { GameAreaWaitingProps } from "./GameAreaWaiting";

export type GameAreaProps = {
  waitingprops?: GameAreaWaitingProps;
  inprogprops?: GameAreaInProgressProps;
};
const GameArea = ({ props }: { props: GameAreaProps }) => {
  return (
    <>
      <Card>
        <CardContent>
          {/* WAITING STATE */}
          {props.waitingprops &&
            props.waitingprops.localGameState.status === GameStatus.WAITING && (
              <GameAreaWaiting props={props.waitingprops} />
            )}

          {/* IN PROGRESS STATE */}
          {props.inprogprops &&
            props.inprogprops.localGameState.status ===
              GameStatus.IN_PROGRESS && (
              <GameAreaInProgress props={props.inprogprops} />
            )}
        </CardContent>
      </Card>
    </>
  );
};

export default GameArea;
