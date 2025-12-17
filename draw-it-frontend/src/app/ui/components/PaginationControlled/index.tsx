"use client";

import {
  Stack,
  Typography,
  Pagination,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { gameListQuerySchema, SortType } from "@/app/lib/validation";

export type PaginationControlledProps = {
  count: number;
  pageSize: number;
  onPaginationChange?: (page: number, sort: SortType) => void;
};

export const PaginationControlled = ({
  count,
  pageSize,
  onPaginationChange,
}: PaginationControlledProps) => {
  /*
   * constants
   */

  /*
   * states
   */
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortType>("desc");

  /*
   * hooks
   */
  // Parse URL params on mount
  useEffect(() => {
    const params = Object.fromEntries(searchParams);
    const parsed = gameListQuerySchema.safeParse(params);

    if (parsed.success) {
      setPage(parsed.data.page);
      setSort(parsed.data.sort);
    }
  }, [searchParams]);

  /*
   * functions
   */
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    updateUrl(value, sort);
    onPaginationChange?.(value, sort);
  };

  const handleSortChange = (event: any) => {
    const newSort = event.target.value as SortType;
    setSort(newSort);
    updateUrl(page, newSort);
    onPaginationChange?.(page, newSort);
  };

  const updateUrl = (newPage: number, newSort: SortType) => {
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    params.set("sort", newSort);
    router.push(`?${params.toString()}`);
  };

  // Calculate total pages
  const totalPages = Math.ceil(count / pageSize);

  return (
    <>
      <Box>
        <Typography>
          Page: {page} / {totalPages}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          disabled={totalPages <= 1}
          variant='outlined'
          shape='rounded'
          color='primary'
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id='sort-select-label'>Sort</InputLabel>
          <Select
            labelId='sort-select-label'
            id='sort-select'
            value={sort}
            label='Sort'
            onChange={handleSortChange}
            size='small'
          >
            <MenuItem value='asc'>Oldest -&gt; Newest</MenuItem>
            <MenuItem value='desc'>Newest -&gt; Oldest</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </>
  );
};
