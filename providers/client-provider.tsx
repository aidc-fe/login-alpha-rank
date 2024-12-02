'use client'

import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { Client } from "@prisma/client";
import request from "@/lib/request";

const ClientContext=createContext<Client | undefined>(undefined);

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [client,setClient]=useState<Client>();

  useEffect(()=>{
    request(`/api/client/get_by_domain/${`pre-login.text2go.ai`}`).then((res)=>{
      setClient(res);
    });
  },[])

return <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
}

export function useClient(){
  const client= useContext(ClientContext) as Client;
  return client || {};
}
