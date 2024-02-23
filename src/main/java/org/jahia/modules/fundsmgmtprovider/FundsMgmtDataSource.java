package org.jahia.modules.fundsmgmtprovider;

import com.google.common.collect.Sets;
import net.sf.ehcache.Cache;
import net.sf.ehcache.CacheException;
import net.sf.ehcache.Element;
import org.apache.commons.lang.StringUtils;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.util.EntityUtils;
import org.jahia.exceptions.JahiaInitializationException;
import org.jahia.modules.external.*;
import org.jahia.modules.external.events.EventService;
import org.jahia.modules.external.query.QueryHelper;
import org.jahia.osgi.BundleUtils;
import org.jahia.services.cache.CacheProvider;
import org.jahia.services.content.JCRSessionFactory;
import org.jahia.services.content.JCRStoreProvider;
import org.jahia.services.content.nodetypes.NodeTypeRegistry;
import org.joda.time.DateTime;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.Designate;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.*;
import java.net.URI;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Pattern;

@Component(service = { ExternalDataSource.class,
        FundsMgmtDataSource.class }, immediate = true, configurationPid = "org.jahia.modules.fundsmgmtprovider")
@Designate(ocd = FundsMgmtDataSource.Config.class)

public class FundsMgmtDataSource implements ExternalDataSource {

    @ObjectClassDefinition(name = "Funds Management Provider", description = "A funds MAnagement configuration")
    public @interface Config {
        @AttributeDefinition(name = "Funds API key", defaultValue = "", description = "The API key to use for The Funds Management Access")
        String apiKey() default "";

        @AttributeDefinition(name = "Funds Management Mount path", defaultValue = "/sites/funds/contents/funds", description = "The path at which to mount the database in the JCR")
        String mountPoint() default "/sites/funds/contents/funds";

    }

    private static final Logger logger = LoggerFactory.getLogger(FundsMgmtDataSource.class);
    public static final HashSet<String> LAZY_PROPERTIES = Sets.newHashSet("fund_name", "share_class", "isin",
            "inception_date", "aum", "as_of_date", "morningstar", "sfdr_article_classification", "asset_class");
    // public static final HashSet<String> LAZY_I18N_PROPERTIES =
    // Sets.newHashSet("jcr:title", "overview", "tagline", "poster_path");

    public static final HashSet<String> ROOT_NODES = Sets.newHashSet("funds");
    public static final int SOCKET_TIMEOUT = 60000;
    public static final int CONNECT_TIMEOUT = 15000;
    public static final int MAX_CONNECTIONS = 10;
    public static final int DEFAULT_MAX_PER_ROUTE = 2;

    private static String API_URL = "https://raw.githubusercontent.com/smonier/funds-management/main/src/main/resources/files/funds/funds.json";
    private static String API_KEY = "api_key";

    private static Pattern YEAR_PATTERN = Pattern.compile("[0-9]{4,4}");
    private static Pattern DATE_PATTERN = Pattern.compile("[0-9]{4,4}/[0-9]{2,2}");

    private static final List<String> EXTENDABLE_TYPES = Arrays.asList("nt:base");

    private CacheProvider cacheProvider;
    private Cache cache;
    private String apiKeyValue = "";

    private String accountId;
    private String token;
    private String sessionId;

    private HttpClient httpClient;

    private ExternalContentStoreProviderFactory externalContentStoreProviderFactory;

    private ExternalContentStoreProvider externalContentStoreProvider;

    public FundsMgmtDataSource() {
    }

    public void setHttpClient(HttpClient httpClient) {
        this.httpClient = httpClient;
    }

    @Reference
    public void setCacheProvider(CacheProvider cacheProvider) {
        this.cacheProvider = cacheProvider;
    }

    public void setApiKeyValue(String apiKeyValue) {
        this.apiKeyValue = apiKeyValue;
    }

    @Reference
    public void setExternalContentStoreProviderFactory(
            ExternalContentStoreProviderFactory externalContentStoreProviderFactory) {
        this.externalContentStoreProviderFactory = externalContentStoreProviderFactory;
    }

    @Activate
    public void start(Config config) throws RepositoryException {
        if (StringUtils.isEmpty(config.apiKey())) {
            logger.warn("API key is not set, Funds Management provider will not initialize.");
            return;
        }
        RequestConfig requestConfig = RequestConfig.custom()
                .setSocketTimeout(SOCKET_TIMEOUT)
                .setConnectTimeout(CONNECT_TIMEOUT)
                .setConnectionRequestTimeout(CONNECT_TIMEOUT)
                .build();

        Registry<ConnectionSocketFactory> registry = RegistryBuilder.<ConnectionSocketFactory>create()
                .register("http", PlainConnectionSocketFactory.getSocketFactory())
                .build();

        PoolingHttpClientConnectionManager httpConnectionManager = new PoolingHttpClientConnectionManager(registry);
        httpConnectionManager.setMaxTotal(MAX_CONNECTIONS);
        httpConnectionManager.setDefaultMaxPerRoute(DEFAULT_MAX_PER_ROUTE);

        httpClient = HttpClients.custom()
                .setConnectionManager(httpConnectionManager)
                .setDefaultRequestConfig(requestConfig)
                .disableCookieManagement()
                .build();
        this.apiKeyValue = config.apiKey();
        externalContentStoreProvider = externalContentStoreProviderFactory.newProvider();
        externalContentStoreProvider.setDataSource(this);
        externalContentStoreProvider.setExtendableTypes(EXTENDABLE_TYPES);
        externalContentStoreProvider.setMountPoint(config.mountPoint());
        externalContentStoreProvider.setKey("FundsMgmtProvider");
        try {
            externalContentStoreProvider.start();
        } catch (JahiaInitializationException e) {
            throw new RepositoryException("Error initializing Funds Management Provider", e);
        }

        try {
            if (!cacheProvider.getCacheManager().cacheExists("funds-cache")) {
                cacheProvider.getCacheManager().addCache("funds-cache");
            }
            cache = cacheProvider.getCacheManager().getCache("funds-cache");
        } catch (IllegalStateException | CacheException e) {
            logger.error("Error while initializing cache for Funds Management", e);
        }
    }

    @Deactivate
    public void stop() {
        if (httpClient != null) {
            httpClient = null;
        }
        if (externalContentStoreProvider != null) {
            externalContentStoreProvider.stop();
        }
    }

    /**
     * @param path path where to get children
     * @return list of paths as String
     */
    @Override
    public List<String> getChildren(String path) throws RepositoryException {

        return null;
    }

    /**
     * identifier is unique for an ExternalData
     *
     * @param identifier
     * @return ExternalData defined by the identifier
     * @throws javax.jcr.ItemNotFoundException
     */
    @Override
    public ExternalData getItemByIdentifier(String identifier) throws ItemNotFoundException {
        return null;
    }

    /**
     * As getItemByIdentifier, get an ExternalData by its path
     *
     * @param path
     * @return ExternalData
     * @throws javax.jcr.PathNotFoundException
     */
    @Override
    public ExternalData getItemByPath(String path) throws PathNotFoundException {
        return null;
    }

    /**
     * Returns a set of supported node types.
     *
     * @return a set of supported node types
     */
    @Override
    public Set<String> getSupportedNodeTypes() {
        return Sets.newHashSet("jnt:contentFolder", "fundmgmtnt:fund");
    }

    /**
     * Indicates if this data source has path-like hierarchical external
     * identifiers, e.g. IDs that are using file system paths.
     *
     * @return <code>true</code> if this data source has path-like hierarchical
     *         external identifiers, e.g. IDs that are using file system
     *         paths; <code>false</code> otherwise.
     */
    @Override
    public boolean isSupportsHierarchicalIdentifiers() {
        return false;
    }

    /**
     * Indicates if the data source supports UUIDs.
     *
     * @return <code>true</code> if the data source supports UUIDs
     */
    @Override
    public boolean isSupportsUuid() {
        return false;
    }

    /**
     * Returns <code>true</code> if an item exists at <code>path</code>; otherwise
     * returns <code>false</code>.
     *
     * @param path item path
     * @return <code>true</code> if an item exists at <code>path</code>; otherwise
     *         returns <code>false</code>
     */
    @Override
    public boolean itemExists(String path) {
        return false;
    }

    private JSONObject queryTMDB(String path, String... params) throws RepositoryException {
        try {
            URIBuilder builder = new URIBuilder()
                    .setScheme("http")
                    .setHost(API_URL)
                    .setPath(path)
                    .setParameter(API_KEY, apiKeyValue);

            for (int i = 0; i < params.length; i += 2) {
                builder.setParameter(params[i], params[i + 1]);
            }

            URI uri = builder.build();

            long l = System.currentTimeMillis();
            HttpGet getMethod = new HttpGet(uri);
            CloseableHttpResponse resp = null;

            try {
                resp = (CloseableHttpResponse) httpClient.execute(getMethod);
                return new JSONObject(EntityUtils.toString(resp.getEntity()));

            } finally {
                if (resp != null) {
                    resp.close();
                }
                logger.debug("Request {} executed in {} ms", uri.toString(), (System.currentTimeMillis() - l));
            }
        } catch (Exception e) {
            logger.error("Error while querying TMDB", e);
            throw new RepositoryException(e);
        }
    }
}
