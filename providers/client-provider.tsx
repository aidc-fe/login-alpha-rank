'use client'

import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { Client } from "@prisma/client";
import request from "@/lib/request";

type ClientWithBusinessDomainType = Client & {  
  isSSO: boolean;
  materials: {image:string,title:string,description:string}[];
};
const ClientContext = createContext<ClientWithBusinessDomainType | undefined>(undefined);

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ClientWithBusinessDomainType>();

  useEffect(() => {
    request(`/api/client/get_by_domain/pre-login.text2go.ai`)
      .then((clientRes) => {
        return  request(`/api/businessDomain/${clientRes.businessDomainId}`)
          .then((businessDomainRes) => {
            setClient({ ...clientRes, isSSO: businessDomainRes.sso });
          });
      }).catch(e=>{
        console.error("Error in API requests:", e);
      });
  }, []);

  return <ClientContext.Provider value={client}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const client = useContext(ClientContext) as ClientWithBusinessDomainType;
  return client || {};
}
