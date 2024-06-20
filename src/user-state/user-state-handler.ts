import { Types } from "mongoose";
import { IMessage } from "../db/db.types.js";
import { Id, UserState } from "./user-state-handler.types.js";

class UserStateHandler {
  private userCache: { [id: Id]: UserState } = {};

  addUser(userState: UserState) {
    this.userCache[userState.id] = userState;
  }

  removeUser(id: Id) {
    delete this.userCache[id];
  }

  updateUserWithNewMessage(
    to: Id,
    message: IMessage & { _id: Types.ObjectId }
  ) {
    const parsedMessage = JSON.stringify(message);
    if (this.checkIfUserExsists(to))
      this.userCache[to].socket.send(parsedMessage);
  }

  checkIfUserExsists(id: Id): boolean {
    return id in this.userCache;
  }
}

export const GlobalUserStateHandler = new UserStateHandler();
