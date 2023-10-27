export type ILoyaltyExternalPointsSettings = {
  Home: IHome
  Store: IStore
  History: IHistory
  Resume: IResume
  Result: IResult
}

type IHome = {
  HOME_HEADER_BUTTON_PONTOS: string
  HOME_HEADER_SUBTITLES: string
  HOME_HEADER_SUBTITLES_HISTORY: string
}

type IStore = {
  COUPONS_STORE_TITLE: string
}

type IHistory = {
  HISTORY_TITLE: string
}

type IResume = {
  COUPONS_RESUME_TITLE_BUTTON: string
  COUPONS_RESUME_NAME_BUTTON: string
}

type IResult = {
  TITLE_SUCCESS: string
  TITLE_UNSUCCESS: string
  MESSAGE_SUCCESS: string
  MESSAGE_UNSUCCESS: string
}
