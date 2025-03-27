import { supabase } from "./supabase-client";

export const insertUserDataToSupabase = async (userData: {
 name: string;
 surname: string;
 secret_key: string;
}) => {
 const { data, error } = await supabase.functions.invoke("encrypt-user-key", {
  body: JSON.stringify(userData),
 });

 if (error) console.error(error);
 console.log(data);
};

export const fetchUsersData = async () => {
 const { data, error } = await supabase.functions.invoke("decrypt-user-key");

 if (error) console.error(error);
 return data;
};
