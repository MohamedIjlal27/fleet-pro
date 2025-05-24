import { postQuestionnaireData } from "./api";
import { useQuestionnaireContext } from "@/context/QuestionnaireContext";

interface QuestionnaireData {
  assetTypes: number[];
  assetCount: number;
  featureInterests: string[];
}

export const useQuestionnaire = () => {
  const context = useQuestionnaireContext();

  const submitQuestionnaireData = async (): Promise<any> => {
    const questionnaireData = context.getQuestionnaireData();
    const token = context.getToken();

    if (!questionnaireData || !token) {
      throw new Error("Questionnaire data or token not found");
    }

    return await postQuestionnaireData(questionnaireData, token);
  };

  return {
    ...context,
    submitQuestionnaireData,
  };
};

export const storeQuestionnaireData = (
  questionnaireData: QuestionnaireData,
  token: string
): void => {
  localStorage.setItem("questionnaire_data", JSON.stringify(questionnaireData));
  localStorage.setItem("auth_token", token);
};

export const getQuestionnaireData = (): QuestionnaireData | null => {
  const data = localStorage.getItem("questionnaire_data");
  return data ? JSON.parse(data) : null;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const submitQuestionnaireData = async (): Promise<any> => {
  const questionnaireData = getQuestionnaireData();
  const token = getStoredToken();

  if (!questionnaireData || !token) {
    throw new Error("Questionnaire data or token not found");
  }

  return await postQuestionnaireData(questionnaireData, token);
};
