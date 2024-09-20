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
        return res.data;
      } else {
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
