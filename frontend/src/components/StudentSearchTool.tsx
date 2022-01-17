import { compareTwoStrings } from "string-similarity";
import { MapItem } from "./Map";
import { Button } from "antd";
import SearchTool from "./SearchTool";
import { School, Student, StudentVerbose } from "wwg-api";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type StudentSearchResult = {
    index: number;
    student: Student & StudentVerbose;
    original: School & { students: (Student & StudentVerbose)[] };
    coordinates?: readonly [number, number];
    similarity: number;
    keyword: string;
};

const StudentSearchTool = ({
    data,
    onSelect,
    hasCoordinate = true,
}: {
    data: readonly MapItem[];
    onSelect: (props: StudentSearchResult) => void;
    hasCoordinate?: boolean;
}) => {
    const [t] = useTranslation();
    const [current, setCurrent] = useState<StudentSearchResult | undefined>();
    const [cached, setCached] = useState<StudentSearchResult[] | undefined>();
    const [cachedKeyword, setCachedKeyword] = useState("");
    return (
        <SearchTool
            placeholder={t("请输入搜索关键词")}
            searchLimit={5}
            dataHandler={(props) => {
                if (cached !== undefined && props.value === cachedKeyword) {
                    return Promise.resolve(
                        cached.slice(props.offset, props.offset + props.limit)
                    );
                }
                const result =
                    (hasCoordinate
                        ? data.filter(
                            (
                                data
                            ): data is {
                                longitude: number;
                                latitude: number;
                            } & MapItem =>
                                data.latitude !== undefined &&
                                data.longitude !== undefined
                        )
                        : data
                    )
                        .flatMap((raw) => {
                            return (
                                raw.students?.map((student, index) => ({
                                    index: index,
                                    student: student,
                                    original: Object.assign({}, raw, {
                                        students: [student],
                                    }),
                                    coordinates:
                                        !!!raw.longitude || !!!raw.latitude
                                            ? undefined
                                            : ([
                                                raw.longitude,
                                                raw.latitude,
                                            ] as const),
                                })) ?? []
                            );
                        })
                        .map((data) => {
                            // Add similarity and keyword to the matched data object
                            // and filter those that have a > 0.5 similarity match
                            return Object.assign(
                                {},
                                data,
                                /* Combine the values in the original (that contains the school information)
                             with values in the student object in data to form an array containing
                             all the information to be matched with the query string.
    
                             Only the closest match will be kept.
                             E.g.: if the school is "UC Berkeley" and the city name is "Berkeley",
                             given search keyword being "Berkeley", the result will be
                             {similarity: 1, keyword Berkeley} since the city name is a better match.
                             */
                                Object.values(
                                    Object.assign(
                                        {},
                                        data.student,
                                        data.original
                                    )
                                ).reduce<{
                                    similarity: number;
                                    keyword: string;
                                }>(
                                    (accu, val) => {
                                        if (
                                            typeof val === "string" ||
                                            typeof val === "number"
                                        ) {
                                            const similarity =
                                                compareTwoStrings(
                                                    val
                                                        .toString()
                                                        .toLowerCase(),
                                                    props.value.toLowerCase()
                                                );
                                            return similarity > accu.similarity
                                                ? {
                                                    similarity: similarity,
                                                    keyword: val.toString(),
                                                }
                                                : accu;
                                        } else {
                                            return accu;
                                        }
                                    },
                                    { similarity: 0, keyword: "" }
                                )
                            );
                        })
                        .filter((data) => data.similarity > 0.5)
                        .sort((a, b) => b.similarity - a.similarity) ?? [];
                setCached(result);
                setCachedKeyword(props.value);
                return Promise.resolve(
                    result.slice(props.offset, props.offset + props.limit)
                );
            }}
            item={(val: StudentSearchResult) => {
                return (
                    <>
                        <Button
                            style={{ width: "100%" }}
                            onClick={() => {
                                onSelect(val);
                                setCurrent(val);
                            }}
                            type={current === val ? "primary" : "default"}
                            size="large"
                            block
                        >
                            <p
                                style={{
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                }}
                            >
                                {val.student.name ?? ""}{" "}
                                <span style={{ fontSize: "0.6rem" }}>
                                    {val.keyword}
                                </span>
                            </p>
                        </Button>
                    </>
                );
            }}
        />
    );
};

export default StudentSearchTool;
