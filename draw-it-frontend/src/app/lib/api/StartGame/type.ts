import { GetGameRequestDto } from "../GetGame/type";

export interface StartGameRequestDto extends GetGameRequestDto {
  gameCode?: string;
}
