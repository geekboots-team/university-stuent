import { supabase } from "@/lib/supabase";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

// Helper functions for SecureStore
const setSecureItem = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
  }
};

const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return null;
  }
};

const removeSecureItem = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
  }
};

interface AppContextType {
  studentTkn: string | null;
  studentRfTkn: string | null;
  studentId: string | null;
  studentNm: string | null;
  studentRole: string | null;
  studentLang: string | null;
  studentStatus: string | null;
  upStudentStatus: (status: string) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loginStudent: (
    studentTkn: string,
    studentRfTkn: string,
    studentId: string,
    studentName: string,
    studentRole: string,
    studentStatus: string,
    studentLang: string
  ) => void;
  logoutStudent: () => void;

  adminTkn: string | null;
  adminRfTkn: string | null;
  adminId: string | null;
  adminNm: string | null;
  loginAdmin: (
    admTkn: string,
    adminRfTkn: string,
    admId: string,
    admName: string
  ) => void;
  logoutAdmin: () => void;

  moderatorTkn: string | null;
  moderatorRfTkn: string | null;
  moderatorId: string | null;
  moderatorNm: string | null;
  loginModerator: (
    modTkn: string,
    moderatorRfTkn: string,
    modId: string,
    modName: string,
    modUni: string
  ) => void;
  logoutModerator: () => void;
  moderatorUni: string | null;

  clubTkn: string | null;
  clubRfTkn: string | null;
  clubId: string | null;
  clubNm: string | null;
  clubUni: string | null;
  clubCId: string | null;
  loginClub: (
    clubTkn: string,
    clubRfTkn: string,
    clubId: string,
    clubName: string,
    clubUni: string,
    clubCId: string
  ) => void;
  logoutClub: () => void;

  companyTkn: string | null;
  companyRfTkn: string | null;
  companyId: string | null;
  companyNm: string | null;
  companyStatus: string | null;
  loginCompany: (
    compTkn: string,
    compRfTkn: string,
    compId: string,
    compName: string,
    compStatus: string
  ) => void;
  logoutCompany: () => void;
}

const AppContext = createContext<AppContextType>({
  studentTkn: null,
  studentRfTkn: null,
  studentId: null,
  studentNm: null,
  studentRole: null,
  studentStatus: null,
  studentLang: null,
  upStudentStatus: () => {},
  loading: true,
  setLoading: () => {},
  loginStudent: () => {},
  logoutStudent: () => {},
  adminTkn: null,
  adminRfTkn: null,
  adminId: null,
  adminNm: null,
  loginAdmin: () => {},
  logoutAdmin: () => {},
  moderatorTkn: null,
  moderatorRfTkn: null,
  moderatorId: null,
  moderatorNm: null,
  moderatorUni: null,
  loginModerator: () => {},
  logoutModerator: () => {},
  loginClub: () => {},
  logoutClub: () => {},
  clubTkn: null,
  clubRfTkn: null,
  clubId: null,
  clubNm: null,
  clubUni: null,
  clubCId: null,
  companyTkn: null,
  companyRfTkn: null,
  companyId: null,
  companyNm: null,
  companyStatus: null,
  loginCompany: () => {},
  logoutCompany: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [studentTkn, setStudentTkn] = useState<string | null>(null);
  const [studentRfTkn, setStudentRfTkn] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentNm, setStudentNm] = useState<string | null>(null);
  const [studentRole, setStudentRole] = useState<string | null>(null);
  const [studentLang, setStudentLang] = useState<string | null>(null);
  const [studentStatus, setStudentStatus] = useState<string | null>(null);

  const [adminTkn, setAdminTkn] = useState<string | null>(null);
  const [adminRfTkn, setAdminRfTkn] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [adminNm, setAdminNm] = useState<string | null>(null);

  const [moderatorTkn, setModeratorTkn] = useState<string | null>(null);
  const [moderatorRfTkn, setModeratorRfTkn] = useState<string | null>(null);
  const [moderatorId, setModeratorId] = useState<string | null>(null);
  const [moderatorNm, setModeratorNm] = useState<string | null>(null);
  const [moderatorUni, setModeratorUni] = useState<string | null>(null);

  const [clubTkn, setClubTkn] = useState<string | null>(null);
  const [clubRfTkn, setClubRfTkn] = useState<string | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubNm, setClubNm] = useState<string | null>(null);
  const [clubUni, setClubUni] = useState<string | null>(null);
  const [clubCId, setClubCId] = useState<string | null>(null);

  const [companyTkn, setCompanyTkn] = useState<string | null>(null);
  const [companyRfTkn, setCompanyRfTkn] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyNm, setCompanyNm] = useState<string | null>(null);
  const [companyStatus, setCompanyStatus] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const refreshSession = async (refreshTkn: string | null) => {
    if (refreshTkn) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshTkn,
      });

      if (error) {
        return false;
      }

      if (data) {
        return data.session;
      }
    } else {
      return false;
    }
  };

  const getUser = async (userTkn: string) => {
    const { data, error } = await supabase.auth.getUser(userTkn ? userTkn : "");

    if (data) {
      return data.user?.id;
    }
  };

  const checkStudentLogin = async () => {
    try {
      setLoading(true);

      const user = await getSecureItem("studentUSTkn");
      const userRef = await getSecureItem("studentUSRfTkn");

      if (user && userRef) {
        const userId = await getUser(user ? user : "");

        const { data: userData } = await supabase
          .from("students")
          .select("*")
          .eq("id", userId)
          .single();

        refreshSession(userRef)
          .then((session) => {
            if (session) {
              loginStudent(
                session.access_token,
                session.refresh_token,
                userId ? userId : "",
                session.user.user_metadata?.first_name +
                  " " +
                  session.user.user_metadata?.last_name,
                userData.role,
                userData.status,
                userData.language
              );
            } else {
              logoutStudent();
            }
          })
          .catch(() => {
            logoutStudent();
          });
      } else {
        logoutStudent();
      }
    } catch {
      logoutStudent();
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginStudent = async (
    studentTkn: string,
    studentRfTkn: string,
    studentId: string,
    studentName: string,
    studentRole: string,
    studentStatus: string,
    studentLang: string
  ) => {
    setStudentTkn(studentTkn);
    setStudentRfTkn(studentRfTkn);
    setStudentId(studentId);
    setStudentNm(studentName);
    setStudentRole(studentRole);
    setStudentStatus(studentStatus);
    setStudentLang(studentLang);

    await Promise.all([
      setSecureItem("studentUSTkn", studentTkn),
      setSecureItem("studentUSRfTkn", studentRfTkn),
      setSecureItem("studentUSId", studentId),
      setSecureItem("studentUSName", studentName),
      setSecureItem("studentUSRole", studentRole),
      setSecureItem("studentUSStatus", studentStatus),
      setSecureItem("studentUSLang", studentLang),
    ]);
  };

  const logoutStudent = async () => {
    setStudentTkn(null);
    setStudentRfTkn(null);
    setStudentId(null);
    setStudentNm(null);
    setStudentRole(null);
    setStudentStatus(null);
    setStudentLang(null);

    await Promise.all([
      removeSecureItem("studentUSTkn"),
      removeSecureItem("studentUSRfTkn"),
      removeSecureItem("studentUSId"),
      removeSecureItem("studentUSName"),
      removeSecureItem("studentUSRole"),
      removeSecureItem("studentUSStatus"),
      removeSecureItem("studentUSLang"),
    ]);
  };

  const upStudentStatus = async (status: string) => {
    setStudentStatus(status);
    await setSecureItem("studentStatus", status);
  };

  const checkAdminLogin = async () => {
    try {
      setLoading(true);

      const storedAdmTkn = await getSecureItem("admTkn");
      const storedAdmRfTkn = await getSecureItem("adminRfTkn");

      const userId = await getUser(storedAdmTkn ? storedAdmTkn : "");

      if (userId) {
        refreshSession(storedAdmRfTkn)
          .then((session) => {
            if (session) {
              loginAdmin(
                session.access_token,
                session.refresh_token,
                userId,
                session.user.user_metadata?.full_name
              );
            } else {
              logoutAdmin();
            }
          })
          .catch(() => {
            logoutAdmin();
          });
      }
    } catch {
      logoutAdmin();
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (
    admTkn: string,
    adminRfTkn: string,
    admId: string,
    admName: string
  ) => {
    setAdminTkn(admTkn);
    setAdminRfTkn(adminRfTkn);
    setAdminId(admId);
    setAdminNm(admName);

    await Promise.all([
      setSecureItem("admTkn", admTkn),
      setSecureItem("adminRfTkn", adminRfTkn),
      setSecureItem("admId", admId),
      setSecureItem("admName", admName),
    ]);
  };

  const logoutAdmin = async () => {
    setAdminTkn(null);
    setAdminRfTkn(null);
    setAdminId(null);
    setAdminNm(null);

    await Promise.all([
      removeSecureItem("admTkn"),
      removeSecureItem("adminRfTkn"),
      removeSecureItem("admId"),
      removeSecureItem("admName"),
    ]);
  };

  const checkModeratorLogin = async () => {
    try {
      setLoading(true);
      const storedModTkn = await getSecureItem("modTkn");
      const storedModRefTkn = await getSecureItem("modRefTkn");

      if (storedModTkn && storedModRefTkn) {
        const userId = await getUser(storedModTkn ? storedModTkn : "");

        const { data: userData } = await supabase
          .from("moderators")
          .select("*")
          .eq("id", userId)
          .single();

        refreshSession(storedModRefTkn)
          .then((session) => {
            if (session) {
              loginModerator(
                session.access_token,
                session.refresh_token,
                userId ? userId : "",
                session.user.user_metadata?.full_name,
                userData.university_id
              );
            } else {
              logoutModerator();
            }
          })
          .catch(() => {
            logoutModerator();
          });
      } else {
        logoutModerator();
      }
    } catch {
      logoutModerator();
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginModerator = async (
    modTkn: string,
    modRefTkn: string,
    modId: string,
    modName: string,
    modUni: string
  ) => {
    setModeratorTkn(modTkn);
    setModeratorRfTkn(modRefTkn);
    setModeratorId(modId);
    setModeratorNm(modName);
    setModeratorUni(modUni);

    await Promise.all([
      setSecureItem("modTkn", modTkn),
      setSecureItem("modRefTkn", modRefTkn),
      setSecureItem("modId", modId),
      setSecureItem("modName", modName),
      setSecureItem("modUni", modUni),
    ]);
  };

  const logoutModerator = async () => {
    setModeratorTkn(null);
    setModeratorRfTkn(null);
    setModeratorId(null);
    setModeratorNm(null);
    setModeratorUni(null);

    await Promise.all([
      removeSecureItem("modTkn"),
      removeSecureItem("modRefTkn"),
      removeSecureItem("modId"),
      removeSecureItem("modName"),
      removeSecureItem("modUni"),
    ]);
  };

  const checkClubLogin = async () => {
    try {
      setLoading(true);
      const storedModTkn = await getSecureItem("clubTkn");
      const storedModRefTkn = await getSecureItem("clubRefTkn");

      if (storedModTkn && storedModRefTkn) {
        const userId = await getUser(storedModTkn ? storedModTkn : "");

        const { data: userData } = await supabase
          .from("club_moderators")
          .select("*")
          .eq("id", userId)
          .single();

        refreshSession(storedModRefTkn)
          .then((session) => {
            if (session) {
              loginClub(
                session.access_token,
                session.refresh_token,
                userId ? userId : "",
                session.user.user_metadata?.full_name,
                userData.university_id,
                userData.club_id
              );
            } else {
              logoutClub();
            }
          })
          .catch(() => {
            logoutClub();
          });
      } else {
        logoutClub();
      }
    } catch {
      logoutClub();
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginClub = async (
    clubTkn: string,
    clubRefTkn: string,
    clubId: string,
    clubName: string,
    clubUni: string,
    clubCId: string
  ) => {
    setClubTkn(clubTkn);
    setClubRfTkn(clubRefTkn);
    setClubId(clubId);
    setClubNm(clubName);
    setClubUni(clubUni);
    setClubCId(clubCId);

    await Promise.all([
      setSecureItem("clubTkn", clubTkn),
      setSecureItem("clubRefTkn", clubRefTkn),
      setSecureItem("clubId", clubId),
      setSecureItem("clubName", clubName),
      setSecureItem("clubUni", clubUni),
      setSecureItem("clubCId", clubCId),
    ]);
  };

  const logoutClub = async () => {
    setClubTkn(null);
    setClubRfTkn(null);
    setClubId(null);
    setClubNm(null);
    setClubUni(null);
    setClubCId(null);

    await Promise.all([
      removeSecureItem("clubTkn"),
      removeSecureItem("clubRefTkn"),
      removeSecureItem("clubId"),
      removeSecureItem("clubName"),
      removeSecureItem("clubUni"),
      removeSecureItem("clubCId"),
    ]);
  };

  const checkCompanyLogin = async () => {
    try {
      setLoading(true);
      const storedCompTkn = await getSecureItem("compTkn");
      const storedCompRefTkn = await getSecureItem("compRefTkn");

      if (storedCompTkn && storedCompRefTkn) {
        const userId = await getUser(storedCompTkn ? storedCompTkn : "");

        const { data: userData } = await supabase
          .from("company")
          .select("*")
          .eq("id", userId)
          .single();

        refreshSession(storedCompRefTkn)
          .then((session) => {
            if (session) {
              loginCompany(
                session.access_token,
                session.refresh_token,
                userId ? userId : "",
                session.user.user_metadata?.full_name,
                userData.status
              );
            } else {
              logoutCompany();
            }
          })
          .catch(() => {
            logoutCompany();
          });
      } else {
        logoutCompany();
      }
    } catch {
      logoutCompany();
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginCompany = async (
    compTkn: string,
    compRefTkn: string,
    compId: string,
    compName: string,
    compStatus: string
  ) => {
    setCompanyTkn(compTkn);
    setCompanyRfTkn(compRefTkn);
    setCompanyId(compId);
    setCompanyNm(compName);
    setCompanyStatus(compStatus);

    await Promise.all([
      setSecureItem("compTkn", compTkn),
      setSecureItem("compRefTkn", compRefTkn),
      setSecureItem("compId", compId),
      setSecureItem("compName", compName),
      setSecureItem("compStatus", compStatus),
    ]);
  };

  const logoutCompany = async () => {
    setCompanyTkn(null);
    setCompanyRfTkn(null);
    setCompanyId(null);
    setCompanyNm(null);
    setCompanyStatus(null);

    await Promise.all([
      removeSecureItem("compTkn"),
      removeSecureItem("compRefTkn"),
      removeSecureItem("compId"),
      removeSecureItem("compName"),
      removeSecureItem("compStatus"),
    ]);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      await Promise.all([
        checkStudentLogin(),
        checkAdminLogin(),
        checkModeratorLogin(),
        checkClubLogin(),
        checkCompanyLogin(),
      ]);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <AppContext.Provider
      value={{
        studentTkn,
        studentRfTkn,
        studentId,
        studentNm,
        studentRole,
        studentStatus,
        studentLang,
        upStudentStatus,
        loginStudent,
        logoutStudent,
        adminTkn,
        adminRfTkn,
        adminId,
        adminNm,
        loginAdmin,
        logoutAdmin,
        moderatorTkn,
        moderatorRfTkn,
        moderatorId,
        moderatorNm,
        moderatorUni,
        loginModerator,
        logoutModerator,
        clubTkn,
        clubRfTkn,
        clubId,
        clubNm,
        clubUni,
        clubCId,
        loginClub,
        logoutClub,
        companyTkn,
        companyRfTkn,
        companyId,
        companyNm,
        companyStatus,
        loginCompany,
        logoutCompany,
        loading,
        setLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
