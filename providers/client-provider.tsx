'use client'

import { useContext } from "react";
import { createContext } from "react";
import { Client } from "@prisma/client";

type ClientWithBusinessDomainType = Client & {  
  isSSO: boolean;
  materials: {image:string,title:string,description:string}[];
};
const ClientContext = createContext<ClientWithBusinessDomainType | undefined>(undefined);

export default function ClientProvider({ children, client }: { children: React.ReactNode, client?: ClientWithBusinessDomainType }) {
  return <ClientContext.Provider value={client}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const client = useContext(ClientContext) as ClientWithBusinessDomainType;
  return client || {};
}
