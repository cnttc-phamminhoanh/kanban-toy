const { getPool, sql } = require("../config/connectData");
const { getIgPool } = require("../config/connectDataMsqls");
class AssemblyRepository {
    async GetAssemblyData(flow, StepNo1, StepNo2) {
        try {
            const pool = await getPool();
            const result = await pool.request()
                .input('flow', sql.VarChar(50), flow)
                // .input('StepNo1', sql.Int, StepNo1)
                // .input('StepNo2', sql.Int, StepNo2)
                .query(`
                SELECT  e.dept as Flow, 
                        e.emp_num as SLNKH,
                        e.fact_emp_num as SLNTT,
                        e.short_code as MH,
                        e.ord_no as PO,
                        e.ord_qty as SLPO,
                        e.pro_no as CDoan,
                        e.plan_qty as SLKH,
                        e.pro_no as StepNo, 
                        e.short_code as Style, 
                        e.ord_no as OrderNo, 
                        '' as WrkOrder, 
                        isnull(s.smv, 0) as SMV
                    FROM RDS_APP.erp_t8_GI.dbo.sfc_pro_emp_num_def01 e 
                    left join [TongeBi].[dbo].[kanban_smv] s on e.short_code =  s.style and e.ord_no = s.ord_no and s.step = e.pro_no
                    where 
                    dept like @flow 
                    and e.pro_no in ('123', '810')
                    and cast(e.pro_date as date) = cast(getdate() as date)
                    and e.sheet_sta = 1;
                `);
            return result.recordset;
        } catch (error) {
            throw error
        }
    }
    //lấy số lượng thực tế
    async GetActualQuantity(flow, StepNo1, StepNo2) {
        try {
            const pool = await getIgPool();
            const result = await pool.execute(`
                select 
                    r.Flow AS Flow, '123' AS StepNo, o.style AS Style, o.OrderNo AS OrderNo, SUM(r.qty) AS ActualOutput
                FROM payroll.pytckreg r
                inner join payroll.pywrkord o on o.Wrkorder = r.WrkOrder
                WHERE RegDate = curdate() AND flow like ? AND StepNo in ('123')
                GROUP by flow, StepNo, o.Style, o.OrderNo 
                union 
                select r.Flow AS Flow, '810' AS StepNo, o.style AS Style, o.OrderNo AS OrderNo, SUM(r.qty) AS ActualOutput
                FROM payroll.pytckreg r
                inner join payroll.pywrkord o on o.Wrkorder = r.WrkOrder
                WHERE RegDate = curdate() AND flow like ? AND StepNo in ('810')
                GROUP by flow, StepNo, o.Style, o.OrderNo
                union
                select r.Flow AS Flow, '123' AS StepNo, o.style AS Style, o.OrderNo AS OrderNo, SUM(r.qty) AS ActualOutput
                FROM payroll.pytckreg3 r
                inner join payroll.pywrkord o on o.Wrkorder = r.WrkOrder
                WHERE RegDate = curdate() AND flow like ? AND StepNo in ('123')
                GROUP by flow, StepNo, o.Style, o.OrderNo 
                union 
                select r.Flow AS Flow, '810' AS StepNo, o.style AS Style, o.OrderNo AS OrderNo, SUM(r.qty) AS ActualOutput
                FROM payroll.pytckreg3 r
                inner join payroll.pywrkord o on o.Wrkorder = r.WrkOrder
                WHERE RegDate = curdate() AND flow like ? AND StepNo in ('810')
                GROUP by flow, StepNo, o.Style, o.OrderNo;
               `, [flow, flow, flow, flow]);
            return result
        } catch (error) {
            throw error
        }
    }
}
module.exports = new AssemblyRepository();