

// import "./App.css";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
// } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import React, { Suspense, useEffect, lazy } from "react";
// import { ItemProvider } from "./components/ItemContext";
// import { ItemProviderPharmacy } from "./components/ItemContextPharmacy";
// import AddDepartment from "./components/AddDepartment";
// import { AuthProvider, useAuth } from "./components/AuthContext";
// import Login from "./components/Login";
// import ProtectedRoute from "./components/ProtectedRoute";
// import RoleProtectedRoute from "./components/RoleProtectedRoute";
// import { ROLES } from "./constants/roles"; // If you haven't already done so
// import InvoiceList from "./components/InvoiceList";
// import ScrollToTopButton from "./components/ScrollToTopButton";
// import AddUsers from "./components/AddUsers";
// import Pharmacy from "./components/Pharmacy";

// // Lazy-loaded components
// const Home = lazy(() => import("./Home"));
// const Invoice = lazy(() => import("./components/Invoice"));
// const Stock = lazy(() => import("./components/Stock"));
// const BarcodeGenerator = lazy(() => import("./components/BarcodeGenerator"));
// const ScanBarcode = lazy(() => import("./components/ScanBarcode"));
// const Expense = lazy(() => import("./components/Expense"));
// const ExpenseHead = lazy(() => import("./components/ExpenseHead"));
// const SaleReport = lazy(() => import("./components/SaleReport"));
// const Employee = lazy(() => import("./components/Employee"));
// const Attendance = lazy(() => import("./components/Attendance"));
// const Supplier = lazy(() => import("./components/Supplier"));
// const Footer = lazy(() => import("./components/Footer"));

// const PharmacyTest = lazy(() => import("./components/PharmacyTest"));

// const EmployeeAttendanceGrid = lazy(() => import("./components/EmployeeAttendanceGrid"));

// // Loading component
// const Loading = () => (
//   <div className="loading-container-new">
//     <div className="loading-spinner"></div>
//   </div>
// );

// // App Component with AuthProvider
// function App() {
//   return (
//     <AuthProvider>
//       <ToastContainer
//         position="top-right"
//         autoClose={2000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss={false}
//         pauseOnHover={false}
//         theme="light"
//         style={{ zIndex: 999999 }} // Add this line
//       />

//       <BrowserRouter>
//         <AppContent />
//         <ScrollToTopButton  />
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// // AppContent Component for routes and layouts
// function AppContent() {
//   const { user } = useAuth();

//   return (
//     <div>
//       <div>
//         <Routes>
//           {/* <Route path="/register-sses-user" element={<Register />} /> */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/logout" element={<Navigate to="/login" />} />
//         </Routes>
//       </div>
//       <div>
//         <ItemProviderPharmacy>
//         <ItemProvider>
//           <Suspense fallback={null}>
//             <Footer />{" "}
//           </Suspense>
//           <Suspense fallback={<div>Loading...</div>}>
//             <Routes>
//             <Route
//   path="/old-pharmacy"
//   element={
//     user ? (
//       <ProtectedRoute>
//         {user.user.user_type === "Receptionist" || user.user.user_type === "Doctor"  || user.user.user_type === "Lab Assistant" || user.user.user_type === "Pharmacy Assistant" ? (
//           <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST , ROLES.DOCTOR, ROLES.LAB_ASSISTANT, ROLES.PHARMACY_ASSISTANT]}>
//             <Pharmacy />
//           </RoleProtectedRoute>
//         ) : (
//           <Navigate to="/login" replace />
//         )}
//       </ProtectedRoute>
//     ) : (
//       <Navigate to="/login" replace />
//     )
//   }
// />



//  <Route
// path="/"
//   element={
//     user ? (
//       <ProtectedRoute>
//         {user.user.user_type === "Receptionist" || user.user.user_type === "Doctor"  || user.user.user_type === "Lab Assistant" || user.user.user_type === "Pharmacy Assistant" ? (
//           <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST , ROLES.DOCTOR, ROLES.LAB_ASSISTANT, ROLES.PHARMACY_ASSISTANT]}>
//             <PharmacyTest />
//           </RoleProtectedRoute>
//         ) : (
//           <Navigate to="/login" replace />
//         )}
//       </ProtectedRoute>
//     ) : (
//       <Navigate to="/login" replace />
//     )
//   }
// />


//               <Route
//                 path="/item-form"
//                 element={
//                   user ? (
//                     <ProtectedRoute >
//                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <Home />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />

//               <Route
//                 path="/add-department"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <AddDepartment />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />



//  <Route
//                 path="/employee-attendance"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <EmployeeAttendanceGrid />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />

              

//               <Route
//                 path="/stock"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                        <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <Stock />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />

//               <Route
//                 path="/barcode"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                         <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <BarcodeGenerator />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />

//               <Route
//                 path="/scan-barcode"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                        <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <ScanBarcode />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />

//               <Route
//                 path="/add-expense"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                        <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <Expense />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />

//               <Route
//                 path="/expense-head"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                        <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <ExpenseHead />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />

//               <Route
//                 path="/sale-report"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                        <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <SaleReport />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />

//               <Route
//                 path="/add-employee"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                        <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <Employee />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />

//               <Route
//                 path="/attendance"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                        <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <Attendance />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />

//               <Route
//                 path="/supplier"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                        <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <Supplier />
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />


//               <Route
//                 path="/add-users"
//                 element={
//                   user ? (
//                     <ProtectedRoute>
//                        <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
//                       <AddUsers/>
//                       </RoleProtectedRoute>
//                     </ProtectedRoute>
//                   ) : (
//                     <Navigate to="/login" replace />
//                   )
//                 }
//               />


//               {/* <Route path="*" element={<div>404 Page Not Found</div>} /> */}
//             </Routes>
//           </Suspense>
//         </ItemProvider>
//        </ItemProviderPharmacy>
//       </div>
//     </div>
//   );
// }

// export default App;





import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { Suspense, useEffect, lazy } from "react";
import { ItemProvider } from "./components/ItemContext";
import { ItemProviderPharmacy } from "./components/ItemContextPharmacy";
import AddDepartment from "./components/AddDepartment";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { ROLES } from "./constants/roles"; // If you haven't already done so
import InvoiceList from "./components/InvoiceList";
import ScrollToTopButton from "./components/ScrollToTopButton";
import AddUsers from "./components/AddUsers";
import Pharmacy from "./components/Pharmacy";
import { POSProvider } from "./components/POSContext";
import GrandLedger from "./components/Grandledger";
// import StaffCommissionManagement from "./components/StaffCommissionManagement";

// Lazy-loaded components
const Home = lazy(() => import("./Home"));
const Invoice = lazy(() => import("./components/Invoice"));
const Stock = lazy(() => import("./components/Stock"));
const BarcodeGenerator = lazy(() => import("./components/BarcodeGenerator"));
const ScanBarcode = lazy(() => import("./components/ScanBarcode"));
const Expense = lazy(() => import("./components/Expense"));
const ExpenseHead = lazy(() => import("./components/ExpenseHead"));
const SaleReport = lazy(() => import("./components/SaleReport"));
const Employee = lazy(() => import("./components/Employee"));
const Attendance = lazy(() => import("./components/Attendance"));
const Supplier = lazy(() => import("./components/Supplier"));
const StaffCommissionManagement = lazy(() => import("./components/StaffCommissionManagement"));

const Footer = lazy(() => import("./components/Footer"));

const PharmacyTest = lazy(() => import("./components/PharmacyTest"));

const EmployeeAttendanceGrid = lazy(() => import("./components/EmployeeAttendanceGrid"));

// Loading component
const Loading = () => (
  <div className="loading-container-new">
    <div className="loading-spinner"></div>
  </div>
);

// App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        theme="light"
        style={{ zIndex: 999999 }} // Add this line
      />

      <BrowserRouter>
        <AppContent />
        <ScrollToTopButton  />
      </BrowserRouter>
    </AuthProvider>
  );
}

// AppContent Component for routes and layouts
function AppContent() {
  const { user } = useAuth();

  return (
    <div>
      <div>
        <Routes>
          {/* <Route path="/register-sses-user" element={<Register />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Navigate to="/login" />} />
        </Routes>
      </div>
      <div style={{display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden'}}>
        <POSProvider>
        <ItemProviderPharmacy>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        <ItemProvider>
          <div style={{flex:1,minHeight:0,overflow:'hidden'}}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
            <Route
  path="/old-pharmacy"
  element={
    user ? (
      <ProtectedRoute>
        {user.user.user_type === "Receptionist" || user.user.user_type === "Doctor"  || user.user.user_type === "Lab Assistant" || user.user.user_type === "Pharmacy Assistant" ? (
          <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST , ROLES.DOCTOR, ROLES.LAB_ASSISTANT, ROLES.PHARMACY_ASSISTANT]}>
            <Pharmacy />
          </RoleProtectedRoute>
        ) : (
          <Navigate to="/login" replace />
        )}
      </ProtectedRoute>
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>



 <Route
path="/"
  element={
    user ? (
      <ProtectedRoute>
        {user.user.user_type === "Admin" || user.user.user_type === "Receptionist" || user.user.user_type === "Doctor"  || user.user.user_type === "Lab Assistant" || user.user.user_type === "Pharmacy Assistant" ? (
          <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST , ROLES.ADMIN, ROLES.DOCTOR, ROLES.LAB_ASSISTANT, ROLES.PHARMACY_ASSISTANT]}>
            <PharmacyTest />
          </RoleProtectedRoute>
        ) : (
          <Navigate to="/login" replace />
        )}
      </ProtectedRoute>
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>


              <Route
                path="/item-form"
                element={
                  user ? (
                    <ProtectedRoute >
                      <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <Home />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />


              <Route
                path="/staff-commission-management"
                element={
                  user ? (
                    <ProtectedRoute >
                      <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <StaffCommissionManagement />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/add-department"
                element={
                  user ? (
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <AddDepartment />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />



<Route
  path="/grand-ledger"
  element={
    user ? (
      <ProtectedRoute>
        <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <GrandLedger />
        </RoleProtectedRoute>
      </ProtectedRoute>
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>



 <Route
                path="/employee-attendance"
                element={
                  user ? (
                    <ProtectedRoute>
                      <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <EmployeeAttendanceGrid />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              

              <Route
                path="/stock"
                element={
                  user ? (
                    <ProtectedRoute>
                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <Stock />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/barcode"
                element={
                  user ? (
                    <ProtectedRoute>
                        <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <BarcodeGenerator />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/scan-barcode"
                element={
                  user ? (
                    <ProtectedRoute>
                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <ScanBarcode />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/add-expense"
                element={
                  user ? (
                    <ProtectedRoute>
                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <Expense />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/expense-head"
                element={
                  user ? (
                    <ProtectedRoute>
                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <ExpenseHead />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/sale-report"
                element={
                  user ? (
                    <ProtectedRoute>
                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <SaleReport />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/add-employee"
                element={
                  user ? (
                    <ProtectedRoute>
                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <Employee />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/attendance"
                element={
                  user ? (
                    <ProtectedRoute>
                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <Attendance />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/supplier"
                element={
                  user ? (
                    <ProtectedRoute>
                       <RoleProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
                      <Supplier />
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />


              <Route
                path="/add-users"
                element={
                  user ? (
                    <ProtectedRoute>
                       <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                      <AddUsers/>
                      </RoleProtectedRoute>
                    </ProtectedRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />


              {/* <Route path="*" element={<div>404 Page Not Found</div>} /> */}
            </Routes>
          </Suspense>
          </div>
          
        </ItemProvider>
       </ItemProviderPharmacy>
       </POSProvider>
      </div>
    </div>
  );
}

export default App;

