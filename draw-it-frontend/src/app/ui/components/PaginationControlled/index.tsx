"use client";

import { gameListQuerySchema, SortType } from "@/app/lib/validation";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";

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
   * states
   */
  const router = useRouter();
  const searchParams = useSearchParams();

  /*
   * constants
   */
  const params = Object.fromEntries(searchParams);
  const parsed = gameListQuerySchema.safeParse(params);

  const page = parsed.success ? parsed.data.page : 1;
  const sort = parsed.success ? parsed.data.sort : "desc";
  /*
   * hooks
   */

  /*
   * functions
   */
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    updateUrl(value, sort);
  };

  const handleSortChange = (event: SelectChangeEvent<SortType>) => {
    const newSort = event.target.value as SortType;
    updateUrl(page, newSort);
  };

  const updateUrl = (newPage: number, newSort: SortType) => {
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    params.set("sort", newSort);
    router.push(`?${params.toString()}`);

    onPaginationChange?.(page, newSort);
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
