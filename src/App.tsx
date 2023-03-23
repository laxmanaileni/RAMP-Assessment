import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [disable,setDisable]=useState(false);
  const [buttonVisibility,setButtonVisibility]=useState(true);
  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const paginateTransactions=useCallback(async () => {
    await paginatedTransactionsUtils.fetchAll()
  }, [paginatedTransactionsUtils])

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    transactionsByEmployeeUtils.invalidateData()
    await employeeUtils.fetchAll()
    
    setIsLoading(false)

    paginateTransactions()
  }, [employeeUtils, transactionsByEmployeeUtils, paginateTransactions])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      await transactionsByEmployeeUtils.fetchById(employeeId)
      paginatedTransactionsUtils.invalidateData()
      
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  
  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return 
            }
            // Bug 6 Part 1 is fixed Here by using useState React Hook buttonVisibility
              if(newValue!==EMPTY_EMPLOYEE){
                setButtonVisibility(false)
              }else if(newValue === EMPTY_EMPLOYEE){
                setButtonVisibility(true)
                setDisable(false)
              }
            if (newValue.id === ''){
              return EMPTY_EMPLOYEE
            }
            await loadTransactionsByEmployee(newValue.id)
          }}
        />
 
        <div className="RampBreak--l" />
       
        <div className="RampGrid">
          <Transactions transactions={transactions} />
          {
          transactions !== null && buttonVisibility===true &&(
           //Bug 5 is Fixed here Just call paginateTransactions
           // Bug 6 Part 2 is Fixed here using [buttonvisibility,setButtonVisibility ==> useState(This is a react hook)] if the list was ended
            <button
              className="RampButton"
             
              disabled={paginatedTransactionsUtils.loading || disable}
              onClick={async () => {
                
                try{await paginateTransactions()}catch(error){console.log(error); setButtonVisibility(false)}
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
