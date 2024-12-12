import { toast } from "react-toastify";

const isBrowser = typeof window !== 'undefined';

export default function request(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  return fetch(input, init)
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      if (res.success) {
        if (res.message && isBrowser) {
          toast.success(res.message);
        }
        return res.data;
      } else {
        if (res.message && isBrowser) {
          toast.error(res.message);
        }
        throw res;
      }
    });
}

export const formatSuccess = (params: { data?: any; message?: string }) => {
  return { success: true, ...params };
};

export const formateError = (params: { code?: string; message?: string }) => {
  return { success: false, ...params };
};
