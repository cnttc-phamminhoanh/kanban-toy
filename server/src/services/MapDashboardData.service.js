
function mapDashboardData(sqlRows, mysqlRows, groupBy = "PO") {
    if (!["PO", "WO"].includes(groupBy)) {
        throw new Error("groupBy phải là PO hoặc WO");
    }

    if (!Array.isArray(sqlRows) || !Array.isArray(mysqlRows)) {
        throw new Error("sqlRows và mysqlRows phải là mảng");
    }

    const normalize = value =>
        String(value ?? "").trim();

    const makeKey = (row) => {
        const flow = normalize(row.Flow);
        const stepNo = normalize(row.StepNo);

        if (groupBy === "WO") {
            const wo = normalize(row.WrkOrder);
            if (!wo) {
                throw new Error(
                    "Thiếu WrkOrder khi ghép dữ liệu theo WO"
                );
            }

            return JSON.stringify([flow, stepNo, wo]);
        }

        return JSON.stringify([
            flow,
            stepNo,
            normalize(row.MH ?? row.Style),
            normalize(row.PO ?? row.OrderNo)
        ]);
    };

    // Kiểm tra dữ liệu WO của hai nguồn
    if (groupBy === "WO") {
        for (const row of [...sqlRows, ...mysqlRows]) {
            if (!normalize(row.WrkOrder)) {
                throw new Error(
                    "Thiếu WrkOrder khi ghép dữ liệu theo WO"
                );
            }
        }
    }

    // Tổng hợp sản lượng thực tế
    const actualMap = new Map();

    for (const row of mysqlRows) {
        const key = makeKey(row);

        actualMap.set(
            key,
            (actualMap.get(key) ?? 0) +
            Number(row.ActualOutput ?? 0)
        );
    }

    // Ghép dữ liệu SQL Server + MySQL
    const resultMap = new Map();

    for (const row of sqlRows) {
        if (row.SMV == null) continue;

        const key = makeKey(row);

        // Một dòng duy nhất cho mỗi khóa
        if (resultMap.has(key)) continue;

        const SLKH = Number(row.SLKH ?? 0);
        const SLNTT = Number(row.SLNTT ?? 0);
        const SMV = Number(row.SMV);
        const SLTT = actualMap.get(key) ?? 0;

        const completionRate =
            SLKH > 0
                ? Number(Math.round((SLTT / SLKH) * 100).toFixed(0))
                : 0;

        const varianceQty = SLTT - SLKH;

        const varianceHours =
            SLNTT > 0
                ? Number(
                    (
                        (varianceQty * SMV) /
                        (SLNTT * 60)
                    ).toFixed(3)
                )
                : 0;

        resultMap.set(key, {
            groupName: row.Flow,
            plannedWorkers: Number(row.SLNKH ?? 0),
            actualWorkers: SLNTT,
            itemCode: groupBy === "WO" ? null : (row.MH ?? row.Style ?? null),
            poCode: groupBy === "WO" ? null : (row.PO ?? row.OrderNo ?? null),
            wrkOrder: row.WrkOrder ?? null,

            poQty: Number(row.SLPO ?? 0),
            operationStaff: row.CDoan,

            goodsNo: row.GoodsNo ?? null,
            goodsName:
                row.GoodsName ??
                row.goods_name ??
                null,

            smv: SMV,
            plannedQty: SLKH,
            actualQty: SLTT,

            completionRate,
            varianceQty,
            varianceHours
        });
    }

    return Array.from(resultMap.values());
}

module.exports = mapDashboardData;
