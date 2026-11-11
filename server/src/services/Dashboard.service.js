const dashboardRepository = require("../repository/Dashboard.repository");
const AssemblyRepository = require("../repository/Assembly.repository");
const InjmoldingRepository = require("../repository/Injmolding.repository");
const MapDashboardDataService = require("./MapDashboardData.service");
class DashboardService {
    async GetDashboardData(flow, StepNo) {
        try {
            const [sqlRows, mysqlResult] = await Promise.all([
                dashboardRepository.GetDashboardData(flow, StepNo),
                dashboardRepository.GetActualQuantity(flow, StepNo)
            ]);

            // mysql2.execute() trả về [rows, fields]
            const mysqlRows = Array.isArray(mysqlResult?.[0])
                ? mysqlResult[0]
                : mysqlResult;
            return MapDashboardDataService(sqlRows, mysqlRows)
        } catch (error) {
            throw error;
        }
    }

    async GetInjmoldingData(flow, StepNo) {
        try {
            const [sqlRows, mysqlResult] = await Promise.all([
                InjmoldingRepository.GetInjmoldingData(flow, StepNo),
                InjmoldingRepository.GetInjmoldingActualQuantity(flow, StepNo)
            ]);
            // console.log(mysqlResult);

            // mysql2.execute() trả về [rows, fields]
            const mysqlRows = Array.isArray(mysqlResult?.[0])
                ? mysqlResult[0]
                : mysqlResult;
            return MapDashboardDataService(sqlRows, mysqlRows, "WO")
        } catch (error) {
            throw error;
        }
    }

    async GetAssemblyData(data) {
        try {
            const [sqlRows, mysqlResult] = await Promise.all([
                AssemblyRepository.GetAssemblyData(data.flow, data.stepNo1, data.stepNo2),
                AssemblyRepository.GetActualQuantity(data.flow, data.stepNo1, data.stepNo2)
            ]);
            // console.log(mysqlResult);

            // mysql2.execute() trả về [rows, fields]
            const mysqlRows = Array.isArray(mysqlResult?.[0])
                ? mysqlResult[0]
                : mysqlResult;
            return MapDashboardDataService(sqlRows, mysqlRows)
        } catch (error) {
            throw error
        }
    }
}
module.exports = new DashboardService(); 