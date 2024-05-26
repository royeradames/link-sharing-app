import React from "react";
import {clsx} from "clsx";

export type THeading = {
    as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    children: React.ReactNode
    className?: string
    id?: string
    size?: 'medium' | "small"
}
export default function Heading({as, children, className='', id, size = 'medium'}: THeading){
    const Heading = as
    const headingStyles = size === 'medium' ? 'font-bold text-[32px] leading-[150%]' : ''
    return (
        <Heading id={id} className={clsx('font-bold leading-[150%]', {
            'text-[32px]': size === 'medium',
            'text-[16px]': size === 'small',
            [className]: !!className
        })}>{children}</Heading>
    )
}
//`${headingStyles}${className}`