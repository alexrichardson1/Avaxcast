import { createStyles, Grid, makeStyles, Typography } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import { Market } from "common/enums";
import { marketIcons, marketNames } from "common/markets";
import { useAppDispatch, useAppSelector } from "hooks";
import { ContractI } from "common/contract";
import { LinkContainer } from "react-router-bootstrap";
import { fromWei } from "web3-utils";
import Fallback from "./Fallback";
import { notLoading } from "actions";
import List from "@material-ui/core/List";

const useStyles = makeStyles(() => {
  const LIST_MARGIN = "10%";
  const POST_MARGIN = "2%";
  return createStyles({
    list: {
      marginLeft: LIST_MARGIN,
      marginRight: LIST_MARGIN,
      padding: 40,
      // marginBottom: MARGIN,
    },
    post: {
      marginTop: POST_MARGIN,
      marginBottom: POST_MARGIN,
    },
  });
});

/**
 * Post for a Market
 * @param props - {@link ContractI}
 * @returns The Post Component
 */
function Post({
  address,
  market,
  predictedPrice,
  date,
  volume,
  yesPrice,
  noPrice,
}: ContractI): JSX.Element {
  const classes = useStyles();
  const formattedDate = date.toDateString();
  return (
    <LinkContainer className={classes.post} to={`/market/${address}`}>
      <Grid item>
        <Card>
          <CardActionArea>
            <CardContent>
              <Grid container justifyContent="center">
                <Grid item xs>
                  <img src={marketIcons[market]} width={"50px"} />
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h6" component="p">
                    {`Will ${marketNames[market]} reach ${predictedPrice} by ${formattedDate}`}
                  </Typography>
                </Grid>
                <Grid item xs>
                  <Typography variant="body2" component="p">
                    {"Total Volume:"}
                  </Typography>
                  <Typography component="p">{`${fromWei(
                    volume
                  )} AVAX`}</Typography>
                </Grid>
                <Grid item xs>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography
                        variant="body1"
                        component="p"
                        align="right">{`Yes: ${fromWei(yesPrice)}`}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="body1"
                        component="p"
                        align="right">{`No: ${fromWei(noPrice)}`}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </LinkContainer>
  );
}

const LESS_THAN = -1;
const GREATER_THAN = 1;
const EQUAL = 0;

interface PropsT {
  contracts: ContractI[];
  deadlineFilter: string[];
  sortByVol: boolean;
}

/**
 * A collection of all posts for the markets
 * @param props - {@link PropsT}
 * @returns The Posts Component
 */
function Posts({ contracts, deadlineFilter, sortByVol }: PropsT): JSX.Element {
  const classes = useStyles();
  const marketFilter = useAppSelector((state) => state.marketFilter);
  const dispatch = useAppDispatch();
  const [start, end] = deadlineFilter;
  const startDate = new Date(start);
  const endDate = new Date(end);

  const filterPost = (post: ContractI): boolean => {
    const withinDates = startDate <= post.date && post.date <= endDate;
    if (marketFilter === Market.ALL) {
      return withinDates;
    }
    return post.market === marketFilter && withinDates;
  };

  const byVol = (contractA: ContractI, contractB: ContractI): number => {
    const volumeDifference = contractA.volume.sub(contractB.volume);
    if (volumeDifference.isNeg()) {
      return LESS_THAN;
    }
    if (volumeDifference.isZero()) {
      return EQUAL;
    }
    return GREATER_THAN;
  };

  const filtered = contracts.filter(filterPost);
  filtered.sort(byVol);

  if (sortByVol) {
    filtered.reverse();
  }

  if (filtered.length === 0) {
    return (
      <Fallback
        warning={""}
        isSnackbarOpen={false}
        handleLoadingClose={() => dispatch(notLoading())}
      />
    );
  }

  return (
    <List className={classes.list} component="nav" aria-label="posts">
      {filtered.map((post) => (
        <Post key={post.address} {...post} />
      ))}
    </List>
  );
}

export default Posts;
