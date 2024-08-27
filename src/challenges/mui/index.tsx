import { Badge, BadgeProps, Box, Flex } from "@chakra-ui/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDateTimePicker } from "@mui/x-date-pickers/StaticDateTimePicker";
import dayjs from "dayjs";
import { defineChallengeConfiguration } from "../../challenge-runner";
import { actions, challenge, expectedDates, serializeDayjs } from "./challenge";

const theme = createTheme({});

export const config = defineChallengeConfiguration({
  challenge,
  timeLimitSeconds: 60,
  renderIntroduction: () => {
    return (
      <>
        There are 20 dates and times you have to submit, but you have 1 minute
        to do it. For each item, select the date and time, then click the OK
        button to submit. You can do them in any order.
        <Box paddingLeft={5} marginTop={4}>
          <ul>
            {expectedDates.map((date, index) => (
              <li key={index}>{date}</li>
            ))}
          </ul>
        </Box>
      </>
    );
  },
  renderChallenge: (state, dispatch) => {
    void actions;
    return (
      <>
        <Flex gap={3} align="center" wrap="wrap">
          {expectedDates.map((date, index) => {
            const props: BadgeProps = {};
            if (state.completed.includes(date)) {
              props.colorScheme = "green";
              props.variant = "solid";
            } else if (state.value === date) {
              props.colorScheme = "green";
            }
            return (
              <Badge key={index} {...props}>
                {date}
              </Badge>
            );
          })}
        </Flex>

        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDateTimePicker
              defaultValue={dayjs()}
              onChange={(date) => {
                if (date) dispatch(actions.s, serializeDayjs(date));
              }}
              onAccept={() => {
                dispatch(actions.a, 0);
              }}
              ampm={false}
            />
          </LocalizationProvider>
        </ThemeProvider>
      </>
    );
  },
});
