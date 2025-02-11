import { Fragment, VFC } from 'react';
import { safeRegExp } from '@server/util/escape-regex';
import { styled } from '@mui/material';

interface IHighlighterProps {
    search?: string;
    children?: string;
    caseSensitive?: boolean;
}

export const StyledSpan = styled('span')(({ theme }) => ({
    '&>mark': {
        backgroundColor: theme.palette.highlight,
    },
}));

export const Highlighter: VFC<IHighlighterProps> = ({
    search,
    children,
    caseSensitive,
}) => {
    if (!children) {
        return null;
    }

    if (!search) {
        return <>{children}</>;
    }

    const regex = safeRegExp(search, caseSensitive ? 'g' : 'gi');

    const parts = children.split(regex);

    const matches = Array.from(children.matchAll(regex)).map(match => match[0]);

    const highlightedText = parts.flatMap((part, index) => {
        return index < matches.length
            ? [part, <mark key={index}>{matches[index]}</mark>]
            : [part];
    });

    return <StyledSpan>{highlightedText}</StyledSpan>;
};
