<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>

<c:set var="title" value="${currentNode.properties['jcr:title'].string}"/>
<c:set var="titleEscaped" value="${not empty title ? fn:escapeXml(title) : fn:escapeXml(currentNode.name)}"/>

<c:set var="teaser" value="${currentNode.properties['teaser'].string}"/>

<c:set var="subNodeView" value="${currentNode.properties['j:subNodesView'].string}"/>
<c:if test="${empty subNodeView}">
    <c:set var="subNodeView" value="blog.headline"/>
</c:if>

<template:include view="hidden.load"/>
<c:set var="listQuery" value="${moduleMap.listQuery}"/>
<jcr:jqom var="result" qomBeanName="listQuery" />

<c:choose>
    <c:when test="${empty result}">
        <p>${moduleMap.emptyListMessage}</p>
    </c:when>
    <c:otherwise>
        <div
            class="paragraph paragraph--type--ds-cartes paragraph--view-mode--default fr-grid-row fr-grid-row--gutters">
            <div class="fr-col-12">
                <div class="fr-grid-row fr-grid-row--middle ds-rangee-de--entete title-only">
                    <h2>${titleEscaped}</h2>
                    ${teaser}
                </div>
                <div class="fr-grid-row fr-grid-row--gutters ds-rangee-de--contenu">
                    <c:forEach items="${result.nodes}" var="node">
                        <div class="fr-col-12">
                            <template:module view="${subNodeView}" node="${node}" />
                        </div>
                    </c:forEach>
                </div>
            </div>
        </div>
    </c:otherwise>
</c:choose>