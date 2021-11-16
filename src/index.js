const W = window;
const WP = window.performance;

const measureTTFB = () => Math.round(
  WP.timing.responseStart - WP.timing.requestStart
);

const measureFCP = () => {
  const FCPPerformance = WP.getEntriesByType('paint')
    .find(entry => entry.name === 'first-contentful-paint');
  if (FCPPerformance) {
    return Math.round(FCPPerformance.startTime);
  }
  return 0;
};

const measureDOMLoad = () => Math.round(
  WP.timing.domContentLoadedEventEnd - WP.timing.navigationStart
);
const measureWindowLoad = () => Math.round(WP.timing.loadEventStart - WP.timing.navigationStart);

const measureResourcesLoad = () => {
  const resourceLoad = WP
    .getEntriesByType('resource')
    .reduce(
      (acc, resource) => acc + (resource.responseEnd - resource.startTime), 0
    );
  return Math.round(resourceLoad);
};

const sendData = (url, body) => {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true
  });
};

const perfAnalytics = ({
  TTFB = true,
  FCP = true,
  domLoad = true,
  windowLoad = true,
  resourceLoad = true,
  url = 'http://localhost:4000/analytics'
} = {}) => ({
  run() {
    W.onload = () => {
      let FCPTime;
      let TTFBTime;
      let domLoadTime;
      let windowLoadTime;
      let resourceLoadTime;
      if (windowLoad) windowLoadTime = measureWindowLoad();
      if (TTFB) TTFBTime = measureTTFB();
      if (domLoad) domLoadTime = measureDOMLoad();
      if (FCP) FCPTime = measureFCP();
      if (resourceLoad) resourceLoadTime = measureResourcesLoad();
      sendData(url, {
        FCPTime, TTFBTime, domLoadTime, windowLoadTime, resourceLoadTime
      });
    };
  }
});

export default perfAnalytics;

export { perfAnalytics };
