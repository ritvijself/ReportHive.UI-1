import React from "react";
import style from "./ConnectedIntegrations.module.css";

export default function ConnectedIntegrations({
  connected,
  handleRemoveIntegration,
}) {
  return (
    <div className={`container py-4 ${style.connectedContainer}`}>
      <h2 className={style.heading}>Connected Integrations</h2>
      <div className={style.connectedList}>
        {connected.length > 0 ? (
          <div className="row row-cols-1 row-cols-md-4 g-2">
            {connected.map((integration, index) => (
              <div key={index} className="col">
                <div className={`${style.integrationCard} border`}>
                  <div className={style.cardHeader}>
                    <div className={style.iconTitle}>
                      <span className={style.integrationIcon}>
                        {integration.icon || "🔗"}
                      </span>
                      <span className={style.integrationTitle}>
                        {integration.name}
                      </span>
                    </div>
                    <div className={style.headerActions}>
                      <button
                        className={style.crossBtn}
                        onClick={() =>
                          handleRemoveIntegration(integration.name)
                        }
                        title="Remove Integration"
                        aria-label={`Remove ${integration.name} integration`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <hr />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={style.noResult}>No connected integrations</p>
        )}
      </div>
    </div>
  );
}
