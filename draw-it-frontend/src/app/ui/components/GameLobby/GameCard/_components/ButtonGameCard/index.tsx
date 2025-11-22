"use client";

import { Button, ButtonOwnProps } from "@mui/material";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
