import { IRequest } from "../../models/IRequest";

export function createRequest(): IRequest {
    return {
      action: "",
      nextScript: "",
      delay: 0,
      content: {
        documents: [],
        index: 0,
        isOffice: true,
        fileName: "",
        docBase64: "",
        fitacData: {},
      },
      config: {
        theme: "light",
        signLegal: false
      },
    };
  }
  