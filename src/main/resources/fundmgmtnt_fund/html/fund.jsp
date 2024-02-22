<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="query" uri="http://www.jahia.org/tags/queryLib" %>

<c:set var="fundName" value="${currentNode.properties['fundName'].string}"/>
<c:set var="isin" value="${currentNode.properties['isin'].string}"/>
<c:set var="fundAssetClass" value="${currentNode.properties['fundAssetClass'].string}"/>
<c:set var="fundCurrency" value="${currentNode.properties['fundCurrency'].string}"/>
<c:set var="fundNav" value="${currentNode.properties['fundNav'].double}"/>
<c:set var="fundNavDate" value="${currentNode.properties['fundNavDate'].date}"/>
