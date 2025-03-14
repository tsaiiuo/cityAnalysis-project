// officeContext.js
import React, { createContext, useState } from "react";

export const OfficeContext = createContext();

export const OfficeProvider = ({ children }) => {
  const [office, setOffice] = useState(null); // 初始值可以是 null 或預設事務所

  return (
    <OfficeContext.Provider value={{ office, setOffice }}>
      {children}
    </OfficeContext.Provider>
  );
};
