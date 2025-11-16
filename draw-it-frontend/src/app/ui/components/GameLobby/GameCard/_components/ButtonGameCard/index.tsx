"use client";

import { Button, ButtonOwnProps } from "@mui/material";
import router from "next/router";
import { Ref } from "react";

type ButtonGameCardProps = {
  url: string;
  className?: string;
  props: ButtonOwnProps;
  textBtn: string;
  ref?: Ref<HTMLButtonElement>;
};

const ButtonGameCard = ({
  url,
  textBtn,
  className,
  ref,
  ...props
}: ButtonGameCardProps) => {
  return (
    <>
      <Button
        className={className}
        ref={ref}
        size='small'
        sx={{ mt: 2, textTransform: "none" }}
        fullWidth
        onClick={(e) => {
          e.stopPropagation();
          router.push(url);
        }}
        {...props.props}
      >
        {textBtn}
      </Button>
    </>
  );
};

export default ButtonGameCard;
