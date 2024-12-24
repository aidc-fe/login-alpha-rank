'use client'

import { useContext, useEffect } from "react";
import { createContext } from "react";
import { ClientDataType } from "@/lib/admin";

type ClientWithBusinessDomainType = ClientDataType & {  
  isSSO: boolean;
  materials: {image:string,title:string,description:string}[];
  url: string;
};

const ClientContext = createContext<ClientWithBusinessDomainType | undefined>(undefined);

export default function ClientProvider({ children, client }: { children: React.ReactNode, client?: ClientWithBusinessDomainType }) {
  return <ClientContext.Provider value={client}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const client = useContext(ClientContext) as ClientWithBusinessDomainType;
  return client || {};
}
