import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface QuestionnaireData {
  assetTypes: number[];
  assetCount: number;
  featureInterests: string[];
}

interface QuestionnaireContextType {
  questionnaireData: QuestionnaireData | null;
  token: string | null;
  storeQuestionnaireData: (data: QuestionnaireData, token: string) => void;
  getQuestionnaireData: () => QuestionnaireData | null;
  getToken: () => string | null;
  clearQuestionnaireData: () => void;
}

const QuestionnaireContext = createContext<
  QuestionnaireContextType | undefined
>(undefined);

export function QuestionnaireProvider({ children }: { children: ReactNode }) {
  const [questionnaireData, setQuestionnaireData] =
    useState<QuestionnaireData | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("questionnaire_data");
    const storedToken = localStorage.getItem("auth_token");

    if (storedData) {
      try {
        setQuestionnaireData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing stored questionnaire data:", error);
      }
    }

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const storeQuestionnaireData = (
    data: QuestionnaireData,
    newToken: string
  ) => {
    // React state update
    setQuestionnaireData(data);
    setToken(newToken);

    // localStorage update
    localStorage.setItem("questionnaire_data", JSON.stringify(data));
    localStorage.setItem("auth_token", newToken);
  };

  const getQuestionnaireData = () => {
    if (questionnaireData) {
      return questionnaireData;
    }

    const storedData = localStorage.getItem("questionnaire_data");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setQuestionnaireData(parsedData);
        return parsedData;
      } catch (error) {
        console.error("Error parsing stored questionnaire data:", error);
      }
    }

    return null;
  };

  const getToken = () => {
    if (token) {
      return token;
    }

    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      return storedToken;
    }

    return null;
  };

  const clearQuestionnaireData = () => {
    setQuestionnaireData(null);
    localStorage.removeItem("questionnaire_data");
  };

  return (
    <QuestionnaireContext.Provider
      value={{
        questionnaireData,
        token,
        storeQuestionnaireData,
        getQuestionnaireData,
        getToken,
        clearQuestionnaireData,
      }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
}

export const useQuestionnaireContext = () => {
  const context = useContext(QuestionnaireContext);
  if (context === undefined) {
    throw new Error(
      "useQuestionnaireContext must be used within a QuestionnaireProvider"
    );
  }
  return context;
};
