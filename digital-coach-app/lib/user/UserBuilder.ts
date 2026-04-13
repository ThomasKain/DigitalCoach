import { Timestamp } from "firebase/firestore";
import getRandomInt from "@App/util/getRandomInt";
import BaseBuilder from "@App/lib/builder/BaseBuilder";
import {
  EUserConcentrations,
  EUserProficiencies,
  IUser,
} from "@App/lib/user/models";

export default class UserBuilder extends BaseBuilder<IUser> {
  private name = "Jon Bellion";
  private email = "jonny@test.com";
  private avatarURL = "";
  private concentration =
    Object.values(EUserConcentrations)[
      getRandomInt(Object.values(EUserConcentrations).length - 1)
    ];
  private proficiency =
    Object.values(EUserProficiencies)[
      getRandomInt(Object.values(EUserProficiencies).length - 1)
    ];
  private createdAt = Timestamp.now();
  private registrationCompletedAt = Timestamp.now();
  private hasCompletedInterview = false;

  build() {
    return {
      name: this.name,
      email: this.email,
      avatarURL: this.avatarURL,
      concentration: this.concentration,
      proficiency: this.proficiency,
      createdAt: this.createdAt,
      registrationCompletedAt: this.registrationCompletedAt,
      hasCompletedInterview: this.hasCompletedInterview
    };
  }
}
